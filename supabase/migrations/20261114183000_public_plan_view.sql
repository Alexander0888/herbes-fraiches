drop policy "Members read the applied plan" on public.published_plan;

grant select on public.published_plan to anon;

create policy "Everyone can read the applied plan"
  on public.published_plan for select to anon, authenticated
  using (true);
