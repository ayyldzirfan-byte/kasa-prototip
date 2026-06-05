-- Kasa blocks 0-9 migration.
-- Supabase/Postgres is UTF-8 by default. utf8mb4 is a MySQL-specific charset name.

alter table public.kasa_profiles
  add column if not exists onay_modu text not null default 'standart',
  add column if not exists total_score integer not null default 0,
  add column if not exists correct_guesses integer not null default 0,
  add column if not exists total_guesses integer not null default 0,
  add column if not exists photo_name text not null default '',
  add column if not exists photo_data text not null default '';

alter table public.kasa_projects
  add column if not exists default_currency text not null default 'TL',
  add column if not exists default_headings text[] not null default '{}'::text[],
  add column if not exists split_type text not null default 'equal',
  add column if not exists template_id text not null default '',
  add column if not exists budget_limits jsonb not null default '{}'::jsonb,
  add column if not exists has_budget_target boolean not null default false,
  add column if not exists has_goal_items boolean not null default false,
  add column if not exists photo_name text not null default '',
  add column if not exists photo_data text not null default '';

alter table public.kasa_project_members
  add column if not exists photo_name text not null default '',
  add column if not exists photo_data text not null default '';

alter table public.kasa_entries
  add column if not exists auto_reveal_at timestamptz,
  add column if not exists rate_locked_at timestamptz not null default now(),
  add column if not exists paid_by_id uuid,
  add column if not exists split_with uuid[] not null default '{}'::uuid[],
  add column if not exists split_ratio numeric[] not null default '{}'::numeric[],
  add column if not exists ocr_raw_text text,
  add column if not exists ocr_parsed_amount numeric,
  add column if not exists installment_group_id uuid,
  add column if not exists installment_index integer not null default 0,
  add column if not exists installment_count integer not null default 0;

update public.kasa_entries
set paid_by_id = coalesce(paid_by_id, user_id),
    rate_locked_at = coalesce(rate_locked_at, created_at, now())
where paid_by_id is null
   or rate_locked_at is null;

alter table public.kasa_entries
  alter column paid_by_id set not null;

alter table public.kasa_entries
  drop column if exists heading_name;

alter table public.kasa_notifications
  add column if not exists guess_deadline timestamptz,
  add column if not exists revealed_at timestamptz,
  add column if not exists is_completed boolean not null default false,
  add column if not exists notification_type text not null default 'entry',
  add column if not exists reaction_emoji text not null default '';

update public.kasa_notifications
set guess_deadline = coalesce(guess_deadline, created_at + interval '48 hours'),
    revealed_at = case when mode = 'surprise' then revealed_at else coalesce(revealed_at, created_at, now()) end,
    is_completed = case when mode = 'surprise' then is_completed else true end
where guess_deadline is null
   or (mode <> 'surprise' and revealed_at is null);

create table if not exists public.kasa_reactions (
  id uuid primary key,
  entry_id uuid not null references public.kasa_entries(id) on delete cascade,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique(entry_id, user_id)
);

create table if not exists public.kasa_reconciliations (
  id uuid primary key,
  project_id uuid not null references public.kasa_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  bank_name text not null default '',
  uploaded_at timestamptz not null default now(),
  statement_total numeric not null default 0,
  kasa_total numeric not null default 0,
  diff numeric not null default 0,
  status text not null default 'pending' check (status in ('matched', 'unmatched', 'pending')),
  raw_rows jsonb not null default '[]'::jsonb
);

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
  note text not null default ''
);

create index if not exists kasa_reactions_project_idx on public.kasa_reactions(project_id);
create index if not exists kasa_reconciliations_project_idx on public.kasa_reconciliations(project_id);
create index if not exists kasa_goals_project_idx on public.kasa_goals(project_id);
create index if not exists kasa_settlements_project_idx on public.kasa_settlements(project_id);

grant select, insert, update on public.kasa_reactions to authenticated;
grant select, insert, update on public.kasa_reconciliations to authenticated;
grant select, insert, update on public.kasa_goals to authenticated;
grant select, insert, update on public.kasa_settlements to authenticated;

alter table public.kasa_reactions enable row level security;
alter table public.kasa_reconciliations enable row level security;
alter table public.kasa_goals enable row level security;
alter table public.kasa_settlements enable row level security;

drop policy if exists "reactions select members" on public.kasa_reactions;
drop policy if exists "reactions write members" on public.kasa_reactions;
create policy "reactions select members" on public.kasa_reactions
  for select using (public.kasa_is_project_member(project_id));
create policy "reactions write members" on public.kasa_reactions
  for all using (public.kasa_is_project_member(project_id) and user_id = auth.uid())
  with check (public.kasa_is_project_member(project_id) and user_id = auth.uid());

drop policy if exists "reconciliations select members" on public.kasa_reconciliations;
drop policy if exists "reconciliations write members" on public.kasa_reconciliations;
create policy "reconciliations select members" on public.kasa_reconciliations
  for select using (public.kasa_is_project_member(project_id));
create policy "reconciliations write members" on public.kasa_reconciliations
  for all using (public.kasa_is_project_member(project_id) and user_id = auth.uid())
  with check (public.kasa_is_project_member(project_id) and user_id = auth.uid());

drop policy if exists "goals select members" on public.kasa_goals;
drop policy if exists "goals write creator" on public.kasa_goals;
create policy "goals select members" on public.kasa_goals
  for select using (public.kasa_is_project_member(project_id));
create policy "goals write creator" on public.kasa_goals
  for all using (public.kasa_is_project_member(project_id) and created_by = auth.uid())
  with check (public.kasa_is_project_member(project_id) and created_by = auth.uid());

drop policy if exists "settlements select members" on public.kasa_settlements;
drop policy if exists "settlements write members" on public.kasa_settlements;
create policy "settlements select members" on public.kasa_settlements
  for select using (public.kasa_is_project_member(project_id));
create policy "settlements write members" on public.kasa_settlements
  for all using (public.kasa_is_project_member(project_id))
  with check (public.kasa_is_project_member(project_id));
