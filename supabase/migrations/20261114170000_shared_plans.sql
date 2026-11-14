create type public.herb_id as enum (
  'persil-plat', 'persil-frise', 'basilic', 'basilic-thai', 'aneth', 'ciboulette',
  'menthe', 'coriandre', 'thym', 'thym-citron', 'cerfeuil', 'estragon', 'laurier',
  'origan', 'romarin', 'sauge', 'mix-herbes-grill'
);

create table public.rayon_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('manager', 'employee'))
);

create table public.plan_templates (
  id text primary key check (length(id) between 1 and 80),
  name text not null check (length(btrim(name)) between 1 and 64),
  slots public.herb_id[] not null check (
    array_ndims(slots) = 1 and array_lower(slots, 1) = 1 and cardinality(slots) = 48
  ),
  example boolean not null default false,
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now()
);

create table public.published_plan (
  id integer primary key check (id = 1),
  template_id text not null,
  name text not null check (length(btrim(name)) between 1 and 64),
  slots public.herb_id[] not null check (
    array_ndims(slots) = 1 and array_lower(slots, 1) = 1 and cardinality(slots) = 48
  ),
  example boolean not null,
  applied_at timestamptz not null,
  revision bigint not null check (revision > 0)
);

alter table public.rayon_members enable row level security;
alter table public.plan_templates enable row level security;
alter table public.published_plan enable row level security;

revoke all on public.rayon_members, public.plan_templates, public.published_plan
  from public, anon, authenticated;
grant select on public.rayon_members, public.plan_templates, public.published_plan to authenticated;
grant insert (id, name, slots, example), update (name, slots), delete
  on public.plan_templates to authenticated;
grant all on public.rayon_members, public.plan_templates, public.published_plan to service_role;

create policy "Read own membership"
  on public.rayon_members for select to authenticated using (user_id = (select auth.uid()));

create policy "Managers manage templates"
  on public.plan_templates for all to authenticated
  using (exists (
    select 1 from public.rayon_members where user_id = (select auth.uid()) and role = 'manager'
  ))
  with check (exists (
    select 1 from public.rayon_members where user_id = (select auth.uid()) and role = 'manager'
  ));

create policy "Members read the applied plan"
  on public.published_plan for select to authenticated
  using (exists (select 1 from public.rayon_members where user_id = (select auth.uid())));

create function public.increment_template_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.revision := old.revision + 1;
  return new;
end;
$$;

revoke execute on function public.increment_template_revision() from public, anon, authenticated;

create trigger increment_template_revision
before update on public.plan_templates
for each row execute function public.increment_template_revision();

create function public.apply_plan(
  source_id text, source_revision bigint, snapshot_name text, snapshot_slots public.herb_id[]
)
returns public.published_plan
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_example boolean;
  result public.published_plan;
begin
  if not exists (
    select 1 from public.rayon_members where user_id = (select auth.uid()) and role = 'manager'
  ) then
    raise insufficient_privilege using message = 'Manager membership is required';
  end if;

  select example into source_example
  from public.plan_templates
  where id = source_id and revision = source_revision
  for share;
  if not found then
    raise sqlstate 'PT409' using message = 'Template has changed since it was loaded';
  end if;

  insert into public.published_plan as current_plan
    (id, template_id, name, slots, example, applied_at, revision)
  values (1, source_id, btrim(snapshot_name), snapshot_slots, source_example, clock_timestamp(), 1)
  on conflict (id) do update set
    template_id = excluded.template_id,
    name = excluded.name,
    slots = excluded.slots,
    example = excluded.example,
    applied_at = clock_timestamp(),
    revision = current_plan.revision + 1
  returning * into result;

  return result;
end;
$$;

revoke execute on function public.apply_plan(text, bigint, text, public.herb_id[]) from public, anon, authenticated;
grant execute on function public.apply_plan(text, bigint, text, public.herb_id[]) to authenticated;

alter publication supabase_realtime add table public.published_plan;
