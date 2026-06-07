-- Kasam production migration.
-- Run in Supabase SQL Editor after the existing schema files.

create extension if not exists pgcrypto;

alter table public.kasa_projects add column if not exists archived_at timestamptz;
alter table public.kasa_projects add column if not exists join_approval_required boolean not null default true;
alter table public.kasa_projects alter column created_by drop not null;
alter table public.kasa_projects drop constraint if exists kasa_projects_created_by_fkey;
alter table public.kasa_projects
  add constraint kasa_projects_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

alter table public.kasa_profiles add column if not exists legal_accepted_at timestamptz;
alter table public.kasa_profiles add column if not exists export_ready_at timestamptz;
alter table public.kasa_profiles add column if not exists onay_modu text not null default 'standart';
alter table public.kasa_profiles add column if not exists total_score integer not null default 0;
alter table public.kasa_profiles add column if not exists correct_guesses integer not null default 0;
alter table public.kasa_profiles add column if not exists total_guesses integer not null default 0;

alter table public.kasa_entries add column if not exists updated_at timestamptz not null default now();
alter table public.kasa_entries add column if not exists auto_reveal_at timestamptz;
alter table public.kasa_entries add column if not exists rate_locked_at timestamptz not null default now();
alter table public.kasa_entries add column if not exists paid_by_id uuid;
alter table public.kasa_entries add column if not exists split_with uuid[] not null default '{}'::uuid[];
alter table public.kasa_entries add column if not exists split_ratio numeric[] not null default '{}'::numeric[];
alter table public.kasa_entries add column if not exists ocr_raw_text text;
alter table public.kasa_entries add column if not exists ocr_parsed_amount numeric;

alter table public.kasa_notifications add column if not exists guess_deadline timestamptz;
alter table public.kasa_notifications add column if not exists revealed_at timestamptz;
alter table public.kasa_notifications add column if not exists is_completed boolean not null default false;
alter table public.kasa_notifications add column if not exists notification_type text not null default 'entry';
alter table public.kasa_notifications add column if not exists reaction_emoji text default '';

create table if not exists public.kasa_reactions (
  id uuid primary key,
  entry_id uuid not null references public.kasa_entries(id) on delete cascade,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (entry_id, user_id)
);

create table if not exists public.kasa_reconciliations (
  id uuid primary key,
  project_id uuid references public.kasa_projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  bank_name text not null,
  format_type text not null default 'csv' check (format_type in ('csv', 'pdf', 'image', 'xlsx')),
  uploaded_at timestamptz not null default now(),
  statement_total numeric not null default 0,
  kasa_total numeric not null default 0,
  diff numeric not null default 0,
  status text not null default 'pending' check (status in ('matched', 'unmatched', 'pending')),
  raw_rows jsonb not null default '[]'::jsonb,
  matched_entry_ids uuid[] not null default '{}'::uuid[],
  unmatched_rows jsonb not null default '[]'::jsonb,
  ai_analysis jsonb
);

alter table public.kasa_reconciliations add column if not exists format_type text not null default 'csv';
alter table public.kasa_reconciliations add column if not exists matched_entry_ids uuid[] not null default '{}'::uuid[];
alter table public.kasa_reconciliations add column if not exists unmatched_rows jsonb not null default '[]'::jsonb;
alter table public.kasa_reconciliations add column if not exists ai_analysis jsonb;
alter table public.kasa_reconciliations alter column project_id drop not null;

create table if not exists public.kasa_goals (
  id uuid primary key,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  deadline date,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.kasa_settlements (
  id uuid primary key,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  settled_at timestamptz not null default now(),
  note text default ''
);

create table if not exists public.kasa_insights (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.kasa_projects(id) on delete cascade,
  type text not null check (type in ('daily', 'weekly', 'monthly', 'goal', 'anomaly', 'coaching', 'success')),
  period text not null,
  insight_data jsonb not null default '{}'::jsonb,
  message text not null,
  action_suggestion text default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.kasa_join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  requester_email text default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (project_id, requester_id)
);

create index if not exists kasa_join_requests_project_idx on public.kasa_join_requests(project_id);
create index if not exists kasa_join_requests_requester_idx on public.kasa_join_requests(requester_id);
create index if not exists kasa_insights_user_idx on public.kasa_insights(user_id, is_read);
create index if not exists kasa_entries_updated_idx on public.kasa_entries(project_id, updated_at);

create or replace function public.kasa_is_project_member(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.kasa_project_members member
    where member.project_id = project_uuid
      and member.user_id = auth.uid()
  );
$$;

create or replace function public.kasa_is_project_owner(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.kasa_projects project
    where project.id = project_uuid
      and project.created_by = auth.uid()
      and project.archived_at is null
  );
$$;

create or replace function public.request_kasa_project_access(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project uuid;
  request_id uuid;
  requester_email text;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select id into target_project
  from public.kasa_projects
  where code = upper(replace(trim(invite_code), ' ', ''))
    and archived_at is null
  limit 1;

  if target_project is null then
    raise exception 'Kasa kodu bulunamadi';
  end if;

  if public.kasa_is_project_member(target_project) then
    return target_project;
  end if;

  select email into requester_email from public.kasa_profiles where id = auth.uid();

  insert into public.kasa_join_requests(project_id, requester_id, requester_email)
  values (target_project, auth.uid(), coalesce(requester_email, ''))
  on conflict (project_id, requester_id) do update
    set status = 'pending',
        decided_at = null
  returning id into request_id;

  return request_id;
end;
$$;

create or replace function public.approve_kasa_join_request(request_uuid uuid, approve_request boolean default true)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project uuid;
  target_user uuid;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select project_id, requester_id
  into target_project, target_user
  from public.kasa_join_requests
  where id = request_uuid
    and status = 'pending';

  if target_project is null then
    raise exception 'Talep bulunamadi';
  end if;

  if not public.kasa_is_project_owner(target_project) then
    raise exception 'Only project owner can approve';
  end if;

  update public.kasa_join_requests
  set status = case when approve_request then 'approved' else 'rejected' end,
      decided_at = now()
  where id = request_uuid;

  if approve_request then
    insert into public.kasa_project_members(project_id, user_id, role)
    values (target_project, target_user, 'member')
    on conflict (project_id, user_id) do nothing;
  end if;

  return target_project;
end;
$$;

create or replace function public.delete_my_kasam_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Login required';
  end if;

  update public.kasa_projects
  set archived_at = now()
  where created_by = current_user_id;

  delete from public.kasa_project_members
  where user_id = current_user_id;

  delete from public.kasa_profiles
  where id = current_user_id;

  delete from auth.users
  where id = current_user_id;
end;
$$;

grant execute on function public.request_kasa_project_access(text) to authenticated;
grant execute on function public.approve_kasa_join_request(uuid, boolean) to authenticated;
grant execute on function public.delete_my_kasam_account() to authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.kasa_profiles to authenticated;
grant select, insert, update, delete on public.kasa_projects to authenticated;
grant select, insert, update, delete on public.kasa_project_members to authenticated;
grant select, insert, update, delete on public.kasa_headings to authenticated;
grant select, insert, update, delete on public.kasa_entries to authenticated;
grant select, insert, update, delete on public.kasa_notifications to authenticated;
grant select, insert, update, delete on public.kasa_reactions to authenticated;
grant select, insert, update, delete on public.kasa_reconciliations to authenticated;
grant select, insert, update, delete on public.kasa_goals to authenticated;
grant select, insert on public.kasa_settlements to authenticated;
grant select, insert, update, delete on public.kasa_insights to authenticated;
grant select, insert, update on public.kasa_join_requests to authenticated;

alter table public.kasa_profiles enable row level security;
alter table public.kasa_projects enable row level security;
alter table public.kasa_project_members enable row level security;
alter table public.kasa_headings enable row level security;
alter table public.kasa_entries enable row level security;
alter table public.kasa_notifications enable row level security;
alter table public.kasa_reactions enable row level security;
alter table public.kasa_reconciliations enable row level security;
alter table public.kasa_goals enable row level security;
alter table public.kasa_settlements enable row level security;
alter table public.kasa_insights enable row level security;
alter table public.kasa_join_requests enable row level security;

drop policy if exists "profiles select" on public.kasa_profiles;
drop policy if exists "profiles insert own" on public.kasa_profiles;
drop policy if exists "profiles update own" on public.kasa_profiles;
drop policy if exists "profiles delete own" on public.kasa_profiles;
create policy "profiles select own" on public.kasa_profiles for select using (id = auth.uid());
create policy "profiles insert own" on public.kasa_profiles for insert with check (id = auth.uid());
create policy "profiles update own" on public.kasa_profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles delete own" on public.kasa_profiles for delete using (id = auth.uid());

drop policy if exists "projects select members" on public.kasa_projects;
drop policy if exists "projects insert owner" on public.kasa_projects;
drop policy if exists "projects update owner" on public.kasa_projects;
drop policy if exists "projects delete owner" on public.kasa_projects;
create policy "projects select members" on public.kasa_projects for select using (created_by = auth.uid() or public.kasa_is_project_member(id));
create policy "projects insert owner" on public.kasa_projects for insert with check (created_by = auth.uid());
create policy "projects update owner" on public.kasa_projects for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "projects delete owner" on public.kasa_projects for delete using (created_by = auth.uid());

drop policy if exists "members select project" on public.kasa_project_members;
drop policy if exists "members insert owner or self" on public.kasa_project_members;
drop policy if exists "members update owner" on public.kasa_project_members;
drop policy if exists "members delete owner" on public.kasa_project_members;
create policy "members select project" on public.kasa_project_members for select using (user_id = auth.uid() or public.kasa_is_project_member(project_id) or public.kasa_is_project_owner(project_id));
create policy "members insert owner or self" on public.kasa_project_members for insert with check (user_id = auth.uid() or public.kasa_is_project_owner(project_id));
create policy "members update owner" on public.kasa_project_members for update using (public.kasa_is_project_owner(project_id)) with check (public.kasa_is_project_owner(project_id));
create policy "members delete owner" on public.kasa_project_members for delete using (public.kasa_is_project_owner(project_id) or user_id = auth.uid());

drop policy if exists "headings select members" on public.kasa_headings;
drop policy if exists "headings write members" on public.kasa_headings;
create policy "headings select members" on public.kasa_headings for select using (public.kasa_is_project_member(project_id));
create policy "headings write members" on public.kasa_headings for all using (public.kasa_is_project_member(project_id)) with check (public.kasa_is_project_member(project_id));

drop policy if exists "entries select members" on public.kasa_entries;
drop policy if exists "entries insert own" on public.kasa_entries;
drop policy if exists "entries update own" on public.kasa_entries;
drop policy if exists "entries delete own" on public.kasa_entries;
create policy "entries select members" on public.kasa_entries for select using (public.kasa_is_project_member(project_id));
create policy "entries insert own" on public.kasa_entries for insert with check (public.kasa_is_project_member(project_id) and user_id = auth.uid());
create policy "entries update own" on public.kasa_entries for update using (user_id = auth.uid()) with check (user_id = auth.uid() and public.kasa_is_project_member(project_id));
create policy "entries delete own" on public.kasa_entries for delete using (user_id = auth.uid());

drop policy if exists "notifications select recipients" on public.kasa_notifications;
drop policy if exists "notifications write members" on public.kasa_notifications;
drop policy if exists "notifications insert actor" on public.kasa_notifications;
drop policy if exists "notifications update recipients" on public.kasa_notifications;
create policy "notifications select recipients" on public.kasa_notifications for select using (actor_id = auth.uid() or auth.uid() = any(recipients));
create policy "notifications insert actor" on public.kasa_notifications for insert with check (actor_id = auth.uid());
create policy "notifications update recipients" on public.kasa_notifications for update using (auth.uid() = any(recipients)) with check (auth.uid() = any(recipients));

drop policy if exists "reactions member select" on public.kasa_reactions;
drop policy if exists "reactions own write" on public.kasa_reactions;
create policy "reactions member select" on public.kasa_reactions for select using (public.kasa_is_project_member(project_id));
create policy "reactions own write" on public.kasa_reactions for all using (public.kasa_is_project_member(project_id) and user_id = auth.uid()) with check (public.kasa_is_project_member(project_id) and user_id = auth.uid());

drop policy if exists "reconciliations own" on public.kasa_reconciliations;
create policy "reconciliations own" on public.kasa_reconciliations for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "goals member select" on public.kasa_goals;
drop policy if exists "goals member write" on public.kasa_goals;
drop policy if exists "goals owner delete" on public.kasa_goals;
create policy "goals member select" on public.kasa_goals for select using (public.kasa_is_project_member(project_id));
create policy "goals member write" on public.kasa_goals for insert with check (public.kasa_is_project_member(project_id));
create policy "goals member update" on public.kasa_goals for update using (public.kasa_is_project_member(project_id)) with check (public.kasa_is_project_member(project_id));
create policy "goals owner delete" on public.kasa_goals for delete using (created_by = auth.uid());

drop policy if exists "settlements related select" on public.kasa_settlements;
drop policy if exists "settlements from insert" on public.kasa_settlements;
create policy "settlements related select" on public.kasa_settlements for select using (from_user_id = auth.uid() or to_user_id = auth.uid());
create policy "settlements from insert" on public.kasa_settlements for insert with check (from_user_id = auth.uid());

drop policy if exists "insights own" on public.kasa_insights;
create policy "insights own" on public.kasa_insights for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "join requests related select" on public.kasa_join_requests;
drop policy if exists "join requests requester insert" on public.kasa_join_requests;
drop policy if exists "join requests owner update" on public.kasa_join_requests;
create policy "join requests related select" on public.kasa_join_requests for select using (requester_id = auth.uid() or public.kasa_is_project_owner(project_id));
create policy "join requests requester insert" on public.kasa_join_requests for insert with check (requester_id = auth.uid());
create policy "join requests owner update" on public.kasa_join_requests for update using (public.kasa_is_project_owner(project_id)) with check (public.kasa_is_project_owner(project_id));
