const templateFields = 'id,name,slots,example,revision';
const publishedFields = 'template_id,name,slots,example,applied_at,revision';

function result({ data, error }) {
  if (error) throw error;
  return data;
}

function snapshot(row) {
  if (!row) return null;
  const { template_id, applied_at, ...plan } = row;
  return { ...plan, templateId: template_id, appliedAt: applied_at };
}

function conflict() {
  return Object.assign(new Error('Template has changed since it was loaded'), { code: 'PT409' });
}

export function createSharedPlanStore(client) {
  const templates = () => client.from('plan_templates');
  const published = () => client.from('published_plan');

  async function loadPublished() {
    return snapshot(result(await published().select(publishedFields).eq('id', 1).maybeSingle()));
  }

  return {
    async load(canEdit) {
      const [current, models] = await Promise.all([
        loadPublished(),
        canEdit ? templates().select(templateFields).order('created_at').order('id') : { data: [] },
      ]);
      return { templates: result(models), published: current };
    },
    loadPublished,
    async saveTemplate(template) {
      const { id, name, slots, example, revision } = template;
      if (revision === undefined) {
        return result(await templates().insert({ id, name, slots, example }).select(templateFields).single());
      }

      const row = result(await templates().update({ name, slots }).eq('id', id).eq('revision', revision)
        .select(templateFields).maybeSingle());
      if (!row) throw conflict();
      return row;
    },
    async deleteTemplate(template) {
      const row = result(await templates().delete().eq('id', template.id).eq('revision', template.revision)
        .select('id').maybeSingle());
      if (!row) throw conflict();
    },
    async applyTemplate(template) {
      return snapshot(result(await client.rpc('apply_plan', {
        source_id: template.id,
        source_revision: template.revision,
        snapshot_name: template.name,
        snapshot_slots: template.slots,
      }).single()));
    },
    watchPublished(refresh, setConnected) {
      const channel = client.channel('rayon-74-published')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'published_plan' }, refresh)
        .subscribe((status) => {
          setConnected(status === 'SUBSCRIBED');
          if (status === 'SUBSCRIBED') refresh();
        });
      return () => { void client.removeChannel(channel); };
    },
  };
}
