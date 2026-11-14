-- Keep both starter layouts in step with src/data/plans.js.
-- Replace only untouched copies of the original starters. The active snapshot
-- and templates made by the manager keep their own contents.
with defaults (id, name, slots, original_slots) as (
  values
    ('normal', 'Journée normale', array[
    null, null, null, null, null, null,
    null, null, null, null, null, null,
    'cerfeuil', 'estragon', 'sauge', 'laurier', 'origan', 'thym-citron',
    'romarin', 'thym', 'basilic-thai', 'mix-herbes-grill', 'menthe', 'menthe',
    'basilic', 'basilic', 'basilic', 'coriandre', 'coriandre', 'coriandre',
    'aneth', 'aneth', 'aneth', 'ciboulette', 'ciboulette', 'ciboulette',
    'persil-frise', 'persil-frise', 'persil-frise', 'persil-frise', 'persil-frise', 'persil-frise',
    'persil-plat', 'persil-plat', 'persil-plat', 'persil-plat', 'persil-plat', 'persil-plat'
  ]::public.herb_id[], array[
    'romarin', 'romarin', 'thym', 'thym', 'aneth', 'aneth',
    'romarin', 'romarin', 'thym', 'thym', 'aneth', 'aneth',
    'persil-frise', 'persil-frise', 'persil-frise', 'persil-plat', 'persil-plat', 'persil-plat',
    'persil-frise', 'persil-frise', 'persil-frise', 'persil-plat', 'persil-plat', 'persil-plat',
    'ciboulette', 'ciboulette', 'menthe', 'menthe', 'coriandre', 'coriandre',
    'ciboulette', 'ciboulette', 'menthe', 'menthe', 'coriandre', 'coriandre',
    'basilic', 'basilic', 'basilic', 'basilic', 'coriandre', 'coriandre',
    'basilic', 'basilic', 'basilic', 'basilic', null, null
  ]::public.herb_id[]),
    ('busy', 'Forte demande', array[
    'cerfeuil', 'estragon', 'sauge', 'sauge', 'laurier', 'laurier',
    'origan', 'origan', 'thym-citron', 'thym-citron', 'basilic-thai', 'basilic-thai',
    'romarin', 'romarin', 'romarin', 'thym', 'thym', 'thym',
    'mix-herbes-grill', 'mix-herbes-grill', 'mix-herbes-grill', 'menthe', 'menthe', 'menthe',
    'basilic', 'basilic', 'basilic', 'coriandre', 'coriandre', 'coriandre',
    'aneth', 'aneth', 'aneth', 'ciboulette', 'ciboulette', 'ciboulette',
    'persil-frise', 'persil-frise', 'persil-frise', 'persil-frise', 'persil-frise', 'persil-frise',
    'persil-plat', 'persil-plat', 'persil-plat', 'persil-plat', 'persil-plat', 'persil-plat'
  ]::public.herb_id[], array[
    'romarin', 'romarin', 'thym', 'thym', 'aneth', 'aneth',
    'ciboulette', 'ciboulette', 'ciboulette', 'thym', 'aneth', 'aneth',
    'persil-frise', 'persil-frise', 'persil-frise', 'persil-plat', 'persil-plat', 'persil-plat',
    'persil-frise', 'persil-frise', 'persil-frise', 'persil-plat', 'persil-plat', 'persil-plat',
    'menthe', 'menthe', 'menthe', 'coriandre', 'coriandre', 'coriandre',
    'menthe', 'menthe', 'menthe', 'coriandre', 'coriandre', 'coriandre',
    'basilic', 'basilic', 'basilic', 'basilic', 'coriandre', 'coriandre',
    'basilic', 'basilic', 'basilic', 'basilic', 'basilic', 'basilic'
  ]::public.herb_id[])
)
insert into public.plan_templates as template (id, name, slots, example)
select id, name, slots, true from defaults
order by case when id = 'normal' then 0 else 1 end
on conflict (id) do update set slots = excluded.slots
where template.example
  and template.revision = 1
  and template.name = excluded.name
  and template.slots = (select original_slots from defaults where id = excluded.id);

insert into public.published_plan
  (id, template_id, name, slots, example, applied_at, revision)
select 1, id, name, slots, example, clock_timestamp(), 1
from public.plan_templates
where id = 'normal'
on conflict (id) do nothing;
