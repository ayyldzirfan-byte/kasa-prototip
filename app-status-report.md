# Kasam — Uygulama Durum Raporu

Tarih: 13.06.2026

## Dosya Yapısı

| Dosya | Amaç | Son değişiklik |
| --- | --- | --- |
| `index.html` | PWA giriş HTML'i, script sırası, meta ve güncelleme bilgisi | 13.06.2026 11:34 |
| `styles.css` | Ana tasarım sistemi, tema, tab bar, oyun overlay ve responsive düzen | 13.06.2026 11:25 |
| `kasa-extra.css` | Ek eski stil katmanı | 09.06.2026 00:14 |
| `app-state.js` | Seed state, sabit listeler, uygulama başlangıç değişkenleri | 13.06.2026 09:04 |
| `app-core.js` | Local storage, render, temel yardımcılar, güvenli metin/URL formatlama | 07.06.2026 23:01 |
| `app-model.js` | Kullanıcı, proje, hareket, bakiye, bildirim ve hesaplama modelleri | 13.06.2026 10:12 |
| `app-views.js` | Ana ekran ve temel ekran render fonksiyonları | 05.06.2026 23:02 |
| `app-bind.js` | Form, tab, tıklama ve ekran olay bağlayıcıları | 03.06.2026 22:52 |
| `app-blocks.js` | Önceki blok özellikleri: rapor, ekstre, hedef, bildirim, hesaplaşma | 13.06.2026 10:13 |
| `app-product-pass.js` | Ürünleşme düzenlemeleri ve ek ekran geçişleri | 10.06.2026 21:29 |
| `app-production.js` | Kasam production katmanı, Supabase push/load, üyelik ve ortak kasa yansımaları | 13.06.2026 11:33 |
| `app-cloud.js` | Supabase load/push adaptörü, üyelik ve notification alan eşlemeleri | 13.06.2026 11:30 |
| `app-sounds.js` | Web Audio API tabanlı doğru/yanlış/bildirim/başarı sesleri | 13.06.2026 11:34 |
| `app-game-v2.js` | 3 aşamalı sürpriz oyun akışı, sticker seti, tanışma skoru, v2 notification render | 13.06.2026 11:38 |
| `app-init.js` | Başlatma geçiş dosyası | 01.06.2026 23:11 |
| `sw.js` | Service worker cache listesi ve offline asset yönetimi | 13.06.2026 11:34 |
| `manifest.webmanifest` | PWA manifest, ikonlar ve start_url cache versiyonu | 13.06.2026 11:27 |
| `_headers` | Netlify security/cache header ayarları | 03.06.2026 23:54 |
| `_redirects` | SPA route fallback | 07.06.2026 22:45 |
| `404.html` | Statik 404 sayfası | 07.06.2026 22:45 |
| `robots.txt` | Arama motoru yönergesi | 07.06.2026 22:45 |
| `sitemap.xml` | Basit site haritası | 09.06.2026 00:28 |
| `gizlilik.html` | KVKK/gizlilik metni | 09.06.2026 00:40 |
| `sartlar.html` | Kullanım şartları | 09.06.2026 00:40 |
| `icon.svg`, `icon-*.png`, `apple-touch-icon.png` | Kasam ikon seti | 09.06.2026 00:20-00:21 |
| `cloud-config.js` | Supabase publishable config | 02.06.2026 21:19 |
| `cloud-config.example.js` | Config örneği | 02.06.2026 20:42 |
| `supabase-production-kasam.sql` | Production temel şema ve RLS | 07.06.2026 22:47 |
| `supabase-blocks-0-9.sql` | Önceki blokların migration dosyası | 05.06.2026 22:59 |
| `supabase-shared-budget-fix.sql` | Ortak kasa/pay ve notification düzeltmeleri | 09.06.2026 21:41 |
| `supabase-game-v2.sql` | 3 aşamalı oyun ve tanışma skoru migration dosyası | 13.06.2026 11:26 |
| `supabase-schema.sql`, `supabase-rls-fix.sql`, `supabase-game-fields.sql` | Eski/yardımcı Supabase şema dosyaları | 02-05.06.2026 |
| `netlify/functions/kasam-ai-coach.js` | AI koç Edge/Function adaptörü | 09.06.2026 00:35 |
| `netlify/functions/kasam-vision.js` | Görsel ekstre analizi adaptörü | 07.06.2026 22:48 |
| `netlify/functions/kasa-giphy-search.js` | Giphy arama proxy'si, API key env'den okunur | 13.06.2026 11:26 |
| `test-game-v2.cjs` | 3 aşamalı oyun, ses, tema ve sticker testleri | 13.06.2026 11:42 |
| `test-kasa-e2e.cjs` | Temel kasa, ortak kasa, güvenlik, döviz ve eski oyun e2e testleri | 13.06.2026 10:14 |
| `test-multi-user-functional-flow.cjs` | Çok kullanıcı ve ortak bütçe fonksiyonel akış testi | 13.06.2026 09:40 |
| `test-cloud-persistence-and-guess-flow.cjs` | Cloud load sonrası local pending veri ve oyun sürekliliği testi | 13.06.2026 09:06 |
| `test-design-system.cjs` | Renk, tipografi, ikon ve tab bar tasarım sistemi testi | 13.06.2026 10:52 |
| `test-theme-contrast.cjs` | Açık/koyu tema kontrast ve oyun overlay testi | 13.06.2026 11:35 |
| `test-pwa.cjs` | PWA manifest, service worker, redirect ve statik sayfa testi | 09.06.2026 00:29 |
| `test-kasam-production.cjs` | Production smoke testi | 07.06.2026 23:02 |
| `test-security.cjs`, `test-kvkk.cjs`, `test-offline.cjs` | Güvenlik, KVKK ve offline testleri | 09.06.2026 |
| `test-statement-engine.cjs`, `test-insights.cjs`, `test-period-reports.cjs` | Ekstre, insight ve dönemsel rapor testleri | 09-13.06.2026 |
| `test-shared-budget-sync.cjs`, `test-shared-ledger.cjs` | Ortak kasa senkron ve defter testleri | 09.06.2026 |
| `vercel.json` | Vercel deployment config | 10.06.2026 21:46 |
| `ANTHROPIC-SETUP.md`, `SUPABASE-KURULUM.md`, `PROJECT_CONTEXT.md` | Kurulum ve proje notları | 02-13.06.2026 |

## Özellik Listesi

| Özellik | Durum | Açıklama |
| --- | --- | --- |
| Temel kasa (gelir/gider/bakiye) | Çalışıyor | Kişisel hareket ve bakiye hesapları mevcut. |
| Ortak bütçe ve pay hesabı | Çalışıyor | `paidById`, `splitWith`, `splitRatio` üzerinden ortak hareketler kişisel kasaya yansıtılıyor. |
| `memberSince` tarihi | Çalışıyor | Üyenin sorumlu olduğu başlangıç tarihi hesaplamaya dahil. |
| Sürpriz bildirim oyunu — 3 aşamalı | Çalışıyor | Kim ekledi, gelir/gider, kategori tahmini sırayla ilerliyor. |
| Tahmin skoru ve tanışma skoru | Çalışıyor | Doğru kim tahmini +10, yanlış +2; kullanıcı skorları güncelleniyor. |
| Tepki sistemi (emoji/gif/sticker) | Kısmi | Sticker ve medya seçici eklendi; Giphy arama için env key gerekir. |
| Ses sistemi | Çalışıyor | Harici ses dosyası olmadan Web Audio API ile üretiliyor, profilden kapatılabiliyor. |
| Ekstre analiz motoru | Kısmi | CSV/PDF/XLSX/vision altyapısı var; gerçek banka dosyalarıyla manuel beta testi gerekir. |
| Akıllı analiz ve koç motoru | Kısmi | Insight fonksiyonları ve AI function iskeleti mevcut; production env gerektirir. |
| Hedef/kumbara modu | Kısmi | Hedef ve ilerleme mantığı var; UX sadeleştirme gerekir. |
| Proje şablonları | Çalışıyor | 5 temel şablon config olarak mevcut. |
| Fiş paylaşımı | Çalışıyor | Fiş görünümü ve paylaşım/download fallback mevcut; kasa dağılımı gösterimi genişletildi. |
| Hesaplaşma ekranı | Çalışıyor | Net bakiye ve minimum transfer algoritması var. |
| Autocomplete | Çalışıyor | Başlık listesi ve keyword/emoji mapping mevcut. |
| Onboarding | Çalışıyor | İlk açılış, kayıt/giriş, demo ve kasa oluşturma akışı mevcut. |
| KVKK / hesap silme / veri export | Kısmi | Statik sayfalar ve export akışı var; auth user silme için backend yetkili function gerekir. |
| Tema sistemi (koyu/açık/auto) | Çalışıyor | CSS değişkenleri ve kontrast testleri mevcut. |
| Offline destek | Kısmi | Service worker ve local pending queue var; gerçek cihaz/airplane-mode testi gerekir. |
| PWA kurulumu | Çalışıyor | Manifest, ikonlar, service worker ve redirect testleri mevcut. |
| Supabase RLS | Kısmi | SQL dosyalarında RLS/policy var; dashboard'da uygulanmış olması gerekir. |

## Veri Şeması

| Tablo | Ana kolonlar | RLS durumu |
| --- | --- | --- |
| `kasa_profiles` | `id`, `name`, `nickname`, `email`, `photo_name`, `photo_data`, `total_score`, `correct_guesses`, `total_guesses`, `onay_modu` | Sahip kullanıcı SELECT/INSERT/UPDATE |
| `kasa_projects` | `id`, `name`, `purpose`, `code`, `created_by`, `member_ids`, `default_currency`, `split_type`, `template_id`, `budget_limits`, `photo_name`, `photo_data` | Üye/sahip SELECT, sahip INSERT/UPDATE/DELETE |
| `kasa_project_members` | `project_id`, `user_id`, `member_since`, `alias`, `photo_name`, `photo_data`, `familiarity_scores` | Proje üyeliği kontrolü |
| `kasa_headings` | `id`, `project_id`, `name`, `short_name`, `emoji` | Proje üyeliği kontrolü |
| `kasa_entries` | `id`, `project_id`, `type`, `amount`, `currency`, `exchange_rate`, `rate_locked_at`, `heading_id`, `user_id`, `paid_by_id`, `split_with`, `split_ratio`, `status`, `locked_notification_id`, `auto_reveal_at`, `ocr_*`, `installment_*` | Proje üyesi SELECT, hareket sahibi INSERT/UPDATE/DELETE |
| `kasa_notifications` | `id`, `project_id`, `entry_id`, `actor_id`, `recipients`, `mode`, `actual_type`, `guess_deadline`, `revealed_at`, `is_completed`, `game_version`, `game_phase`, `phase1_*`, `phase2_*`, `phase3_*`, reaction JSON alanları | Actor/recipient SELECT, actor INSERT, recipient/actor UPDATE |
| `kasa_reactions` | `id`, `entry_id`, `project_id`, `user_id`, `emoji`, `created_at` | Proje üyesi + reaction sahibi |
| `kasa_reconciliations` | `id`, `user_id`, `project_id`, `month`, `bank_name`, `format_type`, `statement_total`, `kasa_total`, `diff`, `raw_rows`, `matched_entry_ids`, `unmatched_rows`, `ai_analysis` | Kullanıcı sahibi |
| `kasa_goals` | `id`, `project_id`, `created_by`, `title`, `target_amount`, `current_amount`, `deadline`, `items`, `status` | Proje üyesi; DELETE creator |
| `kasa_settlements` | `id`, `project_id`, `from_user_id`, `to_user_id`, `amount`, `settled_at`, `note` | Transfer tarafları |
| `kasa_insights` | `id`, `user_id`, `project_id`, `type`, `period`, `insight_data`, `message`, `action_suggestion`, `is_read`, `created_at` | Kullanıcı/proje üyeliği politikası gerekir |

## Bilinen Sorunlar

- `supabase-game-v2.sql` Supabase SQL Editor'da çalıştırılmadan v2 oyun alanları cloud tarafında kalıcı olmaz.
- `GIPHY_API_KEY` Netlify/Vercel environment variable olarak girilmeden GIF arama gerçek sonuç döndürmez.
- AI koç ve vision fonksiyonlarında API key'ler kod içinde değil; production env tanımı yapılmadan canlı çalışmaz.
- KVKK hesap silme akışında Supabase Auth kullanıcısını silmek için server-side yetkili endpoint gerekir.
- Ekstre analiz motoru gerçek banka PDF/görüntü çeşitliliğiyle beta veri seti ister.
- Offline sync ve PWA install davranışı masaüstü testte geçiyor; iOS cihazda ayrıca manuel test edilmeli.

## Test Durumu

| Test dosyası | Kapsam | Son durum |
| --- | --- | --- |
| `test-game-v2.cjs` | 3 aşamalı oyun, tanışma skoru, ses, tema, sticker/GIF | 21 test / 21 geçti |
| `test-theme-contrast.cjs` | Açık/koyu tema ve oyun overlay kontrastı | Geçti |
| `test-design-system.cjs` | Tab bar, token, ikon ve görsel sistem | Geçti |
| `test-pwa.cjs` | Manifest, service worker, PWA dosyaları | Geçti |
| `test-kasam-production.cjs` | Production smoke | Geçti |
| `test-kasa-e2e.cjs` | Kasa, ortak kasa, güvenlik, döviz | 14 test / 14 geçti |
| `test-multi-user-functional-flow.cjs` | Çok kullanıcı ortak kasa akışı | Geçti |
| `test-cloud-persistence-and-guess-flow.cjs` | Cloud persistence ve eski oyun akışı regresyonu | Geçti |
| `test-shared-budget-sync.cjs` | Ortak kasa sync regresyonu | Geçti |
| `test-shared-ledger.cjs` | Playwright tabanlı ortak defter görsel testi | Çalışmadı: ortamda `playwright-core` yok |
| `test-security.cjs`, `test-kvkk.cjs`, `test-offline.cjs` | Güvenlik, KVKK ve offline | Geçti |
| `test-statement-engine.cjs`, `test-insights.cjs`, `test-period-reports.cjs` | Ekstre, insight ve dönemsel rapor | Geçti |

## Sonraki Adımlar

1. Supabase'de `supabase-game-v2.sql` migration'ını çalıştır.
2. Production ortamında `GIPHY_API_KEY` ve AI/vision anahtarlarını env variable olarak tanımla.
3. iOS PWA üzerinde gerçek 3 kullanıcıyla ortak kasa senaryosu test et.
4. Ekstre motoru için 5 bankadan örnek CSV/PDF/XLSX test seti oluştur.
5. Hesap silme için server-side Supabase admin function ekle.
6. Ödeme entegrasyonu ve premium modelini ayrı ürün karar dokümanında netleştir.
