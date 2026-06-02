-- Run this once if the app says: "Supabase izin kuralı engelledi".

create or replace function public.kasa_is_project_owner(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.kasa_projects project
    where project.id = project_uuid
      and project.created_by = auth.uid()
  );
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.kasa_profiles to authenticated;
grant select, insert, update on public.kasa_projects to authenticated;
grant select, insert, update on public.kasa_project_members to authenticated;
grant select, insert, update on public.kasa_headings to authenticated;
grant select, insert, update on public.kasa_entries to authenticated;
grant select, insert, update on public.kasa_notifications to authenticated;

drop policy if exists "projects select members" on public.kasa_projects;
create policy "projects select members" on public.kasa_projects
  for select using (created_by = auth.uid() or public.kasa_is_project_member(id));

drop policy if exists "members select project" on public.kasa_project_members;
drop policy if exists "members insert owner or self" on public.kasa_project_members;
drop policy if exists "members update owner" on public.kasa_project_members;

create policy "members select project" on public.kasa_project_members
  for select using (
    user_id = auth.uid()
    or public.kasa_is_project_owner(project_id)
    or public.kasa_is_project_member(project_id)
  );

create policy "members insert owner or self" on public.kasa_project_members
  for insert with check (
    user_id = auth.uid()
    or public.kasa_is_project_owner(project_id)
  );

create policy "members update owner" on public.kasa_project_members
  for update using (public.kasa_is_project_owner(project_id))
  with check (public.kasa_is_project_owner(project_id));

