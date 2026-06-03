alter table public.kasa_entries
  add column if not exists photo_data text default '',
  add column if not exists locked_notification_id uuid;

alter table public.kasa_notifications
  add column if not exists photo_data text default '',
  add column if not exists gif text default '',
  add column if not exists success_photo_data text default '',
  add column if not exists success_gif text default '',
  add column if not exists fail_photo_data text default '',
  add column if not exists fail_gif text default '';
