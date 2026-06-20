# Kasam — Uygulama Durum Raporu
Tarih: 2026-06-14

## Dosya Yapısı
| Dosya | Amaç | Durum |
|---|---|---|
| `index.html` | PWA kabuğu ve script yükleme sırası | Çalışıyor |
| `styles.css`, `kasam-ui-fixes.css`, `kasam-critical-fixes.css` | Ana görsel sistem, kontrast ve kritik UI düzeltmeleri | Çalışıyor, lint kontrolünde |
| `app-state.js` | Local state ve varsayılan veri | Çalışıyor |
| `app-core.js` | Yardımcı fonksiyonlar, formatlama, navigasyon | Çalışıyor |
| `app-views.js` | Ana ekran render akışları | Aktif geliştirme |
| `app-model.js` | Finansal hesaplar, kişisel pay ve state normalizasyonu | Çalışıyor |
| `app-cloud.js` | Supabase sync ve cloud işlemleri | Kritik alanlar düzeltildi |
| `app-critical-fixes.js` | Kayıt kilidi, duplicate engeli, medya overlay, kritik akış düzeltmeleri | Çalışıyor |
| `app-game-v2.js` | 3 aşamalı tahmin oyunu | Testleri geçiyor |
| `app-test-scenarios.js` | Test senaryosu ve auth bypass | Çalışıyor |
| `kasam-simulator.html` | Çok kullanıcı iframe simülasyonu | Çalışıyor, gerçek PASS/FAIL kontrolleri var |
| `kasam-lint.cjs` | Proje kuralları lint denetimi | Çalışıyor |
| `vercel.json` | Vercel build/output ve header ayarları | `npm run build` + `public` output ayarlı |
| `api/tcmb-rate.js` | Döviz hareketleri için TCMB kur proxy endpoint'i | Syntax kontrolü geçti |
| `build-public.cjs` | Deploy için statik public klasörü üretimi | Çalışıyor |
| `KASAM-RULES.md` | Ürün ve kod kuralları | Güncel |
| `KASAM-OWNER-PROFILE.md` | Proje sahibi tercihleri | Güncel |
| `CODEX-CONTEXT.md` | Codex görev protokolü | Güncel |

## Özellik Listesi
| Özellik | Durum | Açıklama |
|---|---|---|
| Temel kasa gelir/gider/bakiye | Çalışıyor | Node testlerinde geçiyor |
| Ortak bütçe ve pay hesabı | Çalışıyor | Model, simulator ve browser ledger testleri geçiyor |
| Ortak hareketin cloud alanları | Çalışıyor | `paidById`, `splitWith`, `splitRatio`, `rateLockedAt`, `autoRevealAt`, `updatedAt` cloud read/write içinde korunuyor |
| Kişisel kasaya pay yansıması | Çalışıyor | Shared budget ve browser entry flow testleri geçiyor |
| Bildirimlerin alıcılara düşmesi | Çalışıyor | Simulator PASS/FAIL kontrolleri ve açık hareket browser testi geçiyor |
| Duplicate hareket engeli | Çalışıyor | Aynı submit akışından tek entry ve tek notification üretiliyor |
| Açık hareket medya overlay | Çalışıyor | GIF hareket kartından büyük overlay olarak açılıyor |
| memberSince tarihi | Çalışıyor | Test kapsıyor |
| Sürpriz bildirim oyunu — 3 aşamalı | Çalışıyor | Oyun bitmeden bakiye gizli, tamamlanınca açılıyor |
| Tahmin skoru ve tanışma skoru | Çalışıyor | `test-game-v2.cjs` kapsıyor |
| Tepki sistemi | Kısmi | Medya seçici sadeleştirildi, gerçek cihaz UX testi devam etmeli |
| Ses sistemi | Çalışıyor | Mock test geçiyor |
| Test senaryosu auth bypass | Çalışıyor | `testScenario` ve `simUser` akışları doğrulandı |
| Çok kullanıcı simulator | Çalışıyor | Ortak hareket, bildirim alıcıları, kişisel pay ve oyun gizliliği ayrı PASS/FAIL veriyor |
| Tab bar 5 sekme | Çalışıyor | UI testleri geçiyor |
| Renk/kontrast kuralları | Çalışıyor | `kasam-lint.cjs` kontrol ediyor |
| PWA kurulumu | Kısmi | Kullanıcı iOS kurulumunu manuel test etti |
| Supabase RLS | Kısmi | SQL dosyaları var, dashboard uygulanma durumu kullanıcı ortamına bağlı |

## Veri Şeması
| Tablo | Amaç | RLS Durumu |
|---|---|---|
| `kasa_profiles` | Kullanıcı profilleri | SQL policy dosyalarında tanımlı |
| `kasa_projects` | Kişisel ve ortak kasalar | SQL policy dosyalarında tanımlı |
| `kasa_project_members` | Ortak kasa üyelikleri ve üye bazlı alanlar | SQL policy dosyalarında tanımlı |
| `kasa_entries` | Gelir/gider hareketleri | SQL policy dosyalarında tanımlı; ortak pay alanları taşınıyor |
| `kasa_notifications` | Bildirim ve oyun verisi | Game V2 migration ile genişletildi |
| `kasa_reactions` | Hareket tepkileri | SQL policy dosyalarında tanımlı |
| `kasa_goals` | Hedef/kumbara | SQL policy dosyalarında tanımlı |
| `kasa_settlements` | Hesaplaşma kayıtları | SQL policy dosyalarında tanımlı |
| `kasa_reconciliations` | Ekstre uzlaşması | SQL policy dosyalarında tanımlı |

## Bilinen Sorunlar
- Gerçek Supabase ortamında iki ayrı fiziksel cihazla realtime gecikme ve push davranışı ayrıca izlenmeli.
- PWA içinden iOS/WhatsApp native sticker paketleri doğrudan listelenemez; paste/file fallback kullanılmalı.
- Bazı eski kaynaklarda geçmiş encoding hasarı var; yeni değişikliklerde UTF-8 korunmalı.

## Test Durumu
| Test | Sonuç |
|---|---|
| `kasam-lint.cjs` | 12 fail kuralı geçti, KURAL-025/KURAL-026 WARN kontrolleri 0 uyarı verdi |
| `tests/visual-rules.spec.js` | 16 Playwright görsel test eklendi; local modül kurulumu bu oturumda npm/npx olmadığı için çalıştırılamadı |
| `test-kasa-e2e.cjs` | 18 test, 18 geçti, 0 başarısız |
| `test-game-v2.cjs` | 22 test, 22 geçti, 0 başarısız |
| `test-ui-fixes.cjs` | 11 test, 11 geçti, 0 başarısız |
| `test-simulator.cjs` | 9 test, 9 geçti, 0 başarısız |
| `test-shared-budget-sync.cjs` | PASS |
| `test-yilmaz-scenario-rhythm.cjs` | PASS |
| `test-cloud-persistence-and-guess-flow.cjs` | PASS |
| `test-entry-open-flow.cjs` | PASS: tek kayıt, tek bildirim, ortak pay ve GIF overlay |
| `test-shared-ledger.cjs` | PASS |
| `build-public.cjs` | PASS: public klasörü hazır, 41 dosya |
| `api/tcmb-rate.js` | PASS: syntax kontrolü |

## Sonraki Adımlar
1. Production linkinde simulator üzerinden `Ortak Kasa Testi` ve `Tahmin Oyunu Başlat` çalıştırılarak cloud/realtime gecikmeleri gözlenmeli.
2. Gerçek Supabase tablolarında `kasa_entries` ve `kasa_notifications` insert kayıtları iki farklı kullanıcıyla doğrulanmalı.
3. Medya seçici ve bildirim oyunu iPhone üzerinde UX olarak tekrar incelenmeli.

## Son G?ncelleme: Canonical Reset ve Hareket Silme
- ?ifre s?f?rlama linki art?k canonical Vercel adresine gider: https://kasa-prototip.vercel.app/index.html?authAction=reset-password.
- Supabase PASSWORD_RECOVERY event'i uygulama i?inde Yeni ?ifre olu?tur ekran?na y?nlenir.
- Yeni ?ifre kaydedilince oturum kapat?l?r ve kullan?c? yeni ?ifreyle giri? ekran?na d?ner.
- Davet linkleri eski Netlify fallback yerine cloud-config.js appUrl de?erini kullan?r.
- Hareketi ekleyen kullan?c? kendi hareketini silebilir; ilgili bildirim ve tepki kay?tlar? da temizlenir.
- Yeni test: test-password-reset.cjs.

## Son Guncelleme: Ekran Kalabaligi Kurali
- KURAL-039 eklendi: ekran kalabaligi olusturulmayacak.
- Hareket ekleme gibi kritik akislar kullanicidan ayni bilgiyi tekrar istemeyecek; ikincil ayarlar kompakt, acilir veya adim adim gosterilecek.
- kasam-lint.cjs KURAL-039 icin temel kontrol ekledi.

## Son Guncelleme: Tahmin Oyunu Gorsel Kapsam
- Test senaryosu 1 icinde bir aktif tahmin oyunu bilerek acik birakildi; bildirim ekraninda 3 asamali oyun reel tarayici testine dahil edildi.
- Bildirim siralamasi aktif surpiz/tahmin oyunlarini gecmis bildirimlerin ustune alacak sekilde duzeltildi.
- `ensureTestScenarioState` aktif gorunumu her render'da ana ekrana dondurmayacak sekilde korundu; test modunda hareket ekleme ve bildirim ekranlari gezilebilir kalir.
- Local simulasyon: 75 test, 75 gecti, 0 basarisiz.
- Gorsel dogrulama: 21 kontrol, 20 gecti, 1 basarisiz. Basarisiz olan tek madde cloud stamp; canli Vercel halen eski `Guncellendi 14.06.2026 21:15` surumunu servis ediyor.
- Gorseller: `C:\Users\İRFAN AYYILDIZ\Desktop\kasam-test\visual-test-2026-06-14-2305-final-3`.

## Son Guncelleme: Bildirim Gecmisi ve Reel Gorsel Audit
- Aktif tahmin oyunu bildirimleri gecmis bildirimlerden ayrildi; aktif oyun karti ustte kalir, gecmis bildirimler acilir/kapanir gecmis alanina tasinir.
- Bildirim gizlilik kontrolu artik tum sayfayi degil aktif oyun kartini denetler; eski acik bildirimler aktif surpriz gizliligi testini bozmaz.
- Kisisel kasa listesinde ayni kullaniciya ait yinelenen kisisel kasa kartlari tekillestirildi.
- Kisisel kasa detayinda erisim/katilma talebi bolumleri gizlenir; ortak kasada paylasim ve katilma talebi akisi korunur.
- LOCAL SIMULASYON: `kasam-lint.cjs`, `test-ui-fixes.cjs`, `test-game-v2.cjs` gecti.
- GORSEL DOGRULAMA: 14 kontrol, 14 gecti, 0 basarisiz.
- CLOUD TEST: canli Vercel stamp goruldu: `Guncellendi 14.06.2026 23:05`.
- Gorseller: `C:\Users\İRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606201805`.
