-- Kasam shared budget, join approval and notification sync fix.
-- Run this in Supabase SQL Editor on the live project.

create extension if not exists pgcrypto;

alter table public.kasa_projects add column if not exists default_currency text not null default 'TL';
alter table public.kasa_projects add column if not exists default_headings text[] not null default '{}'::text[];
alter table public.kasa_projects add column if not exists split_type text not null default 'equal';
alter table public.kasa_projects add column if not exists template_id text not null default '';
alter table public.kasa_projects add column if not exists budget_limits jsonb not null default '{}'::jsonb;
alter table public.kasa_projects add column if not exists has_budget_target boolean not null default false;
alter table public.kasa_projects add column if not exists has_goal_items boolean not null default false;
alter table public.kasa_projects add column if not exists archived_at timestamptz;
alter table public.kasa_projects add column if not exists join_approval_required boolean not null default true;

alter table public.kasa_project_members add column if not exists alias text default '';
alter table public.kasa_project_members add column if not exists photo_name text not null default '';
alter table public.kasa_project_members add column if not exists photo_data text not null default '';
alter table public.kasa_project_members add column if not exists member_since date not null default current_date;

alter table public.kasa_entries add column if not exists updated_at timestamptz not null default now();
alter table public.kasa_entries add column if not exists auto_reveal_at timestamptz;
alter table public.kasa_entries add column if not exists rate_locked_at timestamptz not null default now();
alter table public.kasa_entries add column if not exists paid_by_id uuid;
alter table public.kasa_entries add column if not exists split_with uuid[] not null default '{}'::uuid[];
alter table public.kasa_entries add column if not exists split_ratio numeric[] not null default '{}'::numeric[];
alter table public.kasa_entries add column if not exists ocr_raw_text text;
alter table public.kasa_entries add column if not exists ocr_parsed_amount numeric;
alter table public.kasa_entries add column if not exists installment_group_id uuid;
alter table public.kasa_entries add column if not exists installment_index integer not null default 0;
alter table public.kasa_entries add column if not exists installment_count integer not null default 0;

alter table public.kasa_notifications add column if not exists guess_deadline timestamptz;
alter table public.kasa_notifications add column if not exists revealed_at timestamptz;
alter table public.kasa_notifications add column if not exists is_completed boolean not null default false;
alter table public.kasa_notifications add column if not exists notification_type text not null default 'entry';
alter table public.kasa_notifications add column if not exists reaction_emoji text default '';

create table if not exists public.kasa_join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  requester_email text default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique(project_id, requester_id)
);

create index if not exists kasa_join_requests_project_idx on public.kasa_join_requests(project_id);
create index if not exists kasa_join_requests_requester_idx on public.kasa_join_requests(requester_id);
create index if not exists kasa_entries_updated_idx on public.kasa_entries(project_id, updated_at);

create or replace function public.kasa_is_project_member(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.kasa_project_members member
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
    select 1
    from public.kasa_projects project
    where project.id = project_uuid
      and project.created_by = auth.uid()
  );
$$;

create or replace function public.request_kasa_project_access(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project public.kasa_projects%rowtype;
  request_id uuid;
  requester_email text;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select * into target_project
  from public.kasa_projects
  where upper(code) = upper(invite_code)
  limit 1;

  if target_project.id is null then
    raise exception 'Project not found';
  end if;

  if exists (
    select 1 from public.kasa_project_members
    where project_id = target_project.id and user_id = auth.uid()
  ) then
    return target_project.id;
  end if;

  if target_project.join_approval_required is false then
    insert into public.kasa_project_members(project_id, user_id, role, member_since)
    values (target_project.id, auth.uid(), 'member', current_date)
    on conflict (project_id, user_id) do nothing;
    return target_project.id;
  end if;

  select email into requester_email from auth.users where id = auth.uid();

  insert into public.kasa_join_requests(project_id, requester_id, requester_email, status)
  values (target_project.id, auth.uid(), coalesce(requester_email, ''), 'pending')
  on conflict (project_id, requester_id)
  do update set status = 'pending', decided_at = null
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
  request_row public.kasa_join_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select * into request_row
  from public.kasa_join_requests
  where id = request_uuid
  limit 1;

  if request_row.id is null then
    raise exception 'Request not found';
  end if;

  if not public.kasa_is_project_owner(request_row.project_id) then
    raise exception 'Only owner can approve';
  end if;

  update public.kasa_join_requests
  set status = case when approve_request then 'approved' else 'rejected' end,
      decided_at = now()
  where id = request_uuid;

  if approve_request then
    insert into public.kasa_project_members(project_id, user_id, role, member_since)
    values (request_row.project_id, request_row.requester_id, 'member', current_date)
    on conflict (project_id, user_id) do nothing;
  end if;

  return request_row.project_id;
end;
$$;

grant execute on function public.request_kasa_project_access(text) to authenticated;
grant execute on function public.approve_kasa_join_request(uuid, boolean) to authenticated;
grant select, insert, update on public.kasa_join_requests to authenticated;

alter table public.kasa_join_requests enable row level security;

drop policy if exists "join requests related select" on public.kasa_join_requests;
drop policy if exists "join requests requester insert" on public.kasa_join_requests;
drop policy if exists "join requests owner update" on public.kasa_join_requests;

create policy "join requests related select" on public.kasa_join_requests
  for select using (requester_id = auth.uid() or public.kasa_is_project_owner(project_id));

create policy "join requests requester insert" on public.kasa_join_requests
  for insert with check (requester_id = auth.uid());

create policy "join requests owner update" on public.kasa_join_requests
  for update using (public.kasa_is_project_owner(project_id))
  with check (public.kasa_is_project_owner(project_id));
