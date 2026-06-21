/*
  KASAM — supabase-commercial-complete-guess.sql
  Çalıştırma tarihi: 2026-06-21

  Bu dosyayı Supabase Dashboard > SQL Editor'a yapıştır ve çalıştır.
  Commercial Next.js uygulamasında tahmin oyunu tamamlanınca bildirimi ve
  bağlı hareketi tek işlemde açar.
*/

alter table public.kasa_entries
  add column if not exists revealed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.kasa_notifications
  add column if not exists revealed_at timestamptz,
  add column if not exists is_completed boolean not null default false;

create or replace function public.complete_kasam_guess(notification_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_notification record;
  reveal_time timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select *
  into target_notification
  from public.kasa_notifications
  where id = notification_uuid
  limit 1;

  if target_notification.id is null then
    raise exception 'Notification not found';
  end if;

  if target_notification.actor_id <> auth.uid()
     and not auth.uid() = any(target_notification.recipients) then
    raise exception 'Access denied';
  end if;

  update public.kasa_notifications
  set is_completed = true,
      revealed_at = coalesce(revealed_at, reveal_time)
  where id = notification_uuid;

  if target_notification.entry_id is not null then
    update public.kasa_entries
    set locked_notification_id = null,
        revealed_at = coalesce(revealed_at, reveal_time),
        updated_at = reveal_time
    where id = target_notification.entry_id;
  end if;
end;
$$;

grant execute on function public.complete_kasam_guess(uuid) to authenticated;
