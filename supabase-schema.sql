-- Kasa prototype cloud schema for Supabase.
-- Run this once in Supabase SQL Editor before adding credentials to cloud-config.js.

create table if not exists public.kasa_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text not null,
  nickname text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kasa_projects (
  id uuid primary key,
  name text not null,
  purpose text default 'Genel kasa',
  code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kasa_project_members (
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  alias text default '',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.kasa_headings (
  id uuid primary key,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  name text not null,
  short_name text not null,
  emoji text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.kasa_entries (
  id uuid primary key,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('expense', 'income', 'receivable', 'payable')),
  amount numeric not null default 0,
  entered_amount numeric not null default 0,
  currency text not null default 'TRY',
  exchange_rate numeric not null default 1,
  heading_id uuid,
  heading_name text not null,
  short_name text not null,
  emoji text default '',
  entry_date date not null,
  note text default '',
  photo_name text default '',
  settlement boolean not null default false,
  status text not null check (status in ('done', 'pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.kasa_notifications (
  id uuid primary key,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  entry_id uuid,
  actor_id uuid not null references auth.users(id) on delete cascade,
  recipients uuid[] not null default '{}'::uuid[],
  mode text not null default 'open',
  actual_type text not null,
  title text not null,
  amount numeric not null default 0,
  emoji text default '',
  photo_name text default '',
  success_reaction text default 'OK',
  success_photo_name text default '',
  fail_reaction text default 'NO',
  fail_photo_name text default '',
  guesses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists kasa_project_members_user_idx on public.kasa_project_members(user_id);
create index if not exists kasa_entries_project_idx on public.kasa_entries(project_id);
create index if not exists kasa_notifications_project_idx on public.kasa_notifications(project_id);

create or replace function public.kasa_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.kasa_profiles(id, email, name, nickname)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Kullanici'),
    coalesce(new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        name = excluded.name,
        nickname = excluded.nickname,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists kasa_on_auth_user_created on auth.users;
create trigger kasa_on_auth_user_created
  after insert on auth.users
  for each row execute function public.kasa_handle_new_user();

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

create or replace function public.join_kasa_project(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project uuid;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select id
  into target_project
  from public.kasa_projects
  where code = upper(replace(trim(invite_code), ' ', ''))
  limit 1;

  if target_project is null then
    raise exception 'Kasa kodu bulunamadi';
  end if;

  insert into public.kasa_project_members(project_id, user_id, role)
  values (target_project, auth.uid(), 'member')
  on conflict (project_id, user_id) do nothing;

  return target_project;
end;
$$;

create or replace function public.add_kasa_member_by_email(project_uuid uuid, member_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  if not exists (
    select 1
    from public.kasa_projects project
    where project.id = project_uuid
      and project.created_by = auth.uid()
  ) then
    raise exception 'Only project owner can add members';
  end if;

  select id
  into target_user
  from public.kasa_profiles
  where lower(email) = lower(trim(member_email))
  limit 1;

  if target_user is null then
    raise exception 'Bu e-posta ile profil yok';
  end if;

  insert into public.kasa_project_members(project_id, user_id, role)
  values (project_uuid, target_user, 'member')
  on conflict (project_id, user_id) do nothing;

  return target_user;
end;
$$;

grant execute on function public.join_kasa_project(text) to authenticated;
grant execute on function public.add_kasa_member_by_email(uuid, text) to authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.kasa_profiles to authenticated;
grant select, insert, update on public.kasa_projects to authenticated;
grant select, insert, update on public.kasa_project_members to authenticated;
grant select, insert, update on public.kasa_headings to authenticated;
grant select, insert, update on public.kasa_entries to authenticated;
grant select, insert, update on public.kasa_notifications to authenticated;

alter table public.kasa_profiles enable row level security;
alter table public.kasa_projects enable row level security;
alter table public.kasa_project_members enable row level security;
alter table public.kasa_headings enable row level security;
alter table public.kasa_entries enable row level security;
alter table public.kasa_notifications enable row level security;

drop policy if exists "profiles select" on public.kasa_profiles;
drop policy if exists "profiles insert own" on public.kasa_profiles;
drop policy if exists "profiles update own" on public.kasa_profiles;
create policy "profiles select" on public.kasa_profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.kasa_project_members me
      join public.kasa_project_members peer on peer.project_id = me.project_id
      where me.user_id = auth.uid()
        and peer.user_id = kasa_profiles.id
    )
  );
create policy "profiles insert own" on public.kasa_profiles
  for insert with check (id = auth.uid());
create policy "profiles update own" on public.kasa_profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "projects select members" on public.kasa_projects;
drop policy if exists "projects insert owner" on public.kasa_projects;
drop policy if exists "projects update owner" on public.kasa_projects;
create policy "projects select members" on public.kasa_projects
  for select using (created_by = auth.uid() or public.kasa_is_project_member(id));
create policy "projects insert owner" on public.kasa_projects
  for insert with check (created_by = auth.uid());
create policy "projects update owner" on public.kasa_projects
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

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

drop policy if exists "headings select members" on public.kasa_headings;
drop policy if exists "headings write members" on public.kasa_headings;
create policy "headings select members" on public.kasa_headings
  for select using (public.kasa_is_project_member(project_id));
create policy "headings write members" on public.kasa_headings
  for all using (public.kasa_is_project_member(project_id))
  with check (public.kasa_is_project_member(project_id));

drop policy if exists "entries select members" on public.kasa_entries;
drop policy if exists "entries insert own" on public.kasa_entries;
drop policy if exists "entries update own" on public.kasa_entries;
create policy "entries select members" on public.kasa_entries
  for select using (public.kasa_is_project_member(project_id));
create policy "entries insert own" on public.kasa_entries
  for insert with check (public.kasa_is_project_member(project_id) and user_id = auth.uid());
create policy "entries update own" on public.kasa_entries
  for update using (public.kasa_is_project_member(project_id) and user_id = auth.uid())
  with check (public.kasa_is_project_member(project_id) and user_id = auth.uid());

drop policy if exists "notifications select recipients" on public.kasa_notifications;
drop policy if exists "notifications write members" on public.kasa_notifications;
create policy "notifications select recipients" on public.kasa_notifications
  for select using (public.kasa_is_project_member(project_id));
create policy "notifications write members" on public.kasa_notifications
  for all using (public.kasa_is_project_member(project_id))
  with check (public.kasa_is_project_member(project_id));
