# Commercial Supabase Tablo Eslemesi

Son guncelleme: 2026-06-21

Bu dosya commercial Next.js uygulamasinin mevcut `kasa_` Supabase tablolariyla nasil konustugunu belgeler. Amac yeni ticari uygulamanin production verisini bozmadan okuyup yazmasidir.

## Okunan Tablolar

| Supabase tablo | Commercial state | Kritik alanlar |
|---|---|---|
| `kasa_profiles` | `profiles` | `id`, `email`, `name`, `nickname`, `photo_data`, `total_score`, `correct_guesses`, `total_guesses` |
| `kasa_projects` | `projects` | `id`, `name`, `purpose/type`, `code`, `created_by`, `photo_data`, `default_currency`, `default_headings`, `split_type`, `join_approval_required`, `archived_at` |
| `kasa_project_members` | `projects[].members` | `project_id`, `user_id`, `role`, `alias`, `photo_data`, `member_since`, `familiarity_scores` |
| `kasa_entries` | `entries` | `paid_by_id`, `split_with`, `split_ratio`, `entered_amount`, `amount`, `currency`, `exchange_rate`, `rate_locked_at`, `locked_notification_id`, `revealed_at`, `auto_reveal_at`, `ocr_*`, `installment_*` |
| `kasa_notifications` | `notifications` | `actor_id`, `recipients`, `mode`, `notification_type`, `actual_type`, `title`, `amount`, `guess_deadline`, `game_phase`, `is_completed`, `phase*_guesses`, `phase3_options`, reaction json alanlari |
| `kasa_goals` | `goals` | `created_by`, `project_id`, `target_amount`, `current_amount`, `deadline`, `status` |
| `kasa_reactions` | `reactions` | `entry_id`, `project_id`, `user_id`, `emoji` |
| `kasa_settlements` | `settlements` | `from_user_id`, `to_user_id`, `amount`, `settled_at` |
| `kasa_reconciliations` | `reconciliations` | `format_type`, `matched_entry_ids`, `unmatched_rows`, `ai_analysis` |
| `kasa_insights` | `insights` | `type`, `period`, `insight_data`, `message`, `action_suggestion`, `is_read` |

## Yazilan Payloadlar

`createCommercialCloudEntry()` artik payload'u `commercial/src/lib/cloud-schema.ts` icindeki builder fonksiyonlarindan alir:

- `buildEntryInsertPayload()`
- `buildNotificationInsertPayload()`

Bu iki fonksiyon tek kaynak kabul edilir. Commercial app icinde entry veya notification insert payload'u elle tekrar kurulmaz.

## Para ve Doviz Kurali

- `entered_amount`: kullanicinin girdigi orijinal tutar.
- `amount`: TL karsiligi.
- `currency`: `TRY` cloud'dan okunurken commercial modelde `TL` olur.
- `exchange_rate`: hareketin olustugu anda kilitlenen kur.
- `rate_locked_at`: kurun kilitlendigi an.

Doviz hareketlerinde commercial model `amount` alaninda orijinal tutari, `exchangeRate` alaninda kilitli kuru tutar. TL etkisi `entryTlAmount(amount, exchangeRate)` ile hesaplanir.

## Ortak Kasa Pay Kurali

- `paid_by_id`: hareketi odeyen veya geliri giren kullanici.
- `split_with`: hareketin yansidigi kullanici listesi.
- `split_ratio`: `split_with` ile ayni sirada pay oranlari.
- Toplam oran 1 degilse mapper guvenli esit pay fallback'i kullanir.

Bu alanlar eksik veya hatali map edilirse ortak kasa ve kisisel kasa etkisi bozulur. Bu nedenle `cloud-schema.test.ts` ve `test-commercial-cloud-adapter.cjs` bu alanlari zorunlu kontrol eder.

## Oyun Gizliligi

Sürpriz oyun icin kritik kural:

- `locked_notification_id` dolu ve `revealed_at` bos ise hareket bakiyeye yansimaz.
- Bildirim `actor_id` kullanicisina bekleyen surpriz olarak gosterilmez.
- `recipients` icindeki kullanicilar oyunu tamamlayana kadar detay gormez.

## Geriye Uyumluluk

Mapper eski satirlarda eksik kolon varsa fallback kullanir:

- `entered_amount` yoksa `currency=TL` icin `amount`, doviz icin `amount / exchange_rate`.
- `split_with/split_ratio` yoksa odeyen kisi tek pay sahibi kabul edilir.
- Opsiyonel tablolar yoksa app acilmaya devam eder.
