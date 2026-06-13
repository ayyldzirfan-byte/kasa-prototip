alter table public.kasa_notifications
  add column if not exists hide_actor boolean default true,
  add column if not exists game_phase integer default 1 check (game_phase between 1 and 3),
  add column if not exists phase1_guesses jsonb default '[]'::jsonb,
  add column if not exists phase2_guesses jsonb default '[]'::jsonb,
  add column if not exists phase3_options text[] default array[]::text[],
  add column if not exists phase3_correct integer default 0 check (phase3_correct between 0 and 3),
  add column if not exists phase3_guesses jsonb default '[]'::jsonb,
  add column if not exists phase3_image text,
  add column if not exists actor_wrong_reaction jsonb default '{"type":"emoji","data":"✕"}'::jsonb,
  add column if not exists actor_correct_reaction jsonb default '{"type":"emoji","data":"✓"}'::jsonb,
  add column if not exists type_wrong_reaction jsonb default '{"type":"emoji","data":"✕"}'::jsonb,
  add column if not exists type_correct_reaction jsonb default '{"type":"emoji","data":"✓"}'::jsonb,
  add column if not exists category_wrong_reaction jsonb default '{"type":"emoji","data":"✕"}'::jsonb,
  add column if not exists category_correct_reaction jsonb default '{"type":"emoji","data":"✓"}'::jsonb,
  add column if not exists phase1_completed boolean default false,
  add column if not exists phase2_completed boolean default false,
  add column if not exists phase3_completed boolean default false,
  add column if not exists game_fully_completed boolean default false,
  add column if not exists game_version text default 'v1';

alter table public.kasa_project_members
  add column if not exists familiarity_scores jsonb default '{}'::jsonb;

update public.kasa_notifications
set game_version = 'v2'
where mode = 'surprise'
  and (game_version is null or game_version = 'v1')
  and hide_actor is not null;

drop policy if exists "notifications update game guesses recipients" on public.kasa_notifications;
create policy "notifications update game guesses recipients" on public.kasa_notifications
  for update using (auth.uid() = any(recipients) or auth.uid() = actor_id)
  with check (auth.uid() = any(recipients) or auth.uid() = actor_id);

drop policy if exists "project members update familiarity own project" on public.kasa_project_members;
create policy "project members update familiarity own project" on public.kasa_project_members
  for update using (
    exists (
      select 1
      from public.kasa_project_members m
      where m.project_id = kasa_project_members.project_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.kasa_project_members m
      where m.project_id = kasa_project_members.project_id
        and m.user_id = auth.uid()
    )
  );
