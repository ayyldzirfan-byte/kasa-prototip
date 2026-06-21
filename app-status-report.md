# Kasam - Uygulama Durum Raporu
Tarih: 2026-06-21

## Dosya Yapisi
| Dosya | Amac | Durum |
|---|---|---|
| `index.html` | PWA kabugu ve script yukleme sirasi | Calisiyor |
| `styles.css`, `kasam-ui-fixes.css`, `kasam-critical-fixes.css` | Gorsel sistem, kontrast ve kritik UI duzeltmeleri | Calisiyor |
| `app-state.js` | Local state ve varsayilan veri | Calisiyor |
| `app-core.js` | Yardimci fonksiyonlar, formatlama, navigasyon | Calisiyor |
| `app-views.js` | Eski render katmani | Kritik override ile destekleniyor |
| `app-model.js` | Finansal hesaplar, kisisel pay ve state normalizasyonu | Calisiyor |
| `app-cloud.js` | Supabase sync ve cloud islemleri | Kritik alanlar duzeltildi |
| `app-critical-fixes.js` | Kayit kilidi, duplicate engeli, medya overlay, realtime refresh ve kritik akis duzeltmeleri | Aktif production katmani |
| `app-game-v2.js` | 3 asamali tahmin oyunu | Testleri geciyor |
| `app-test-scenarios.js` | Test senaryosu ve auth bypass | Calisiyor |
| `kasam-simulator.html` | Cok kullanici iframe simulasyonu | Calisiyor, PASS/FAIL kontrolleri var |
| `kasam-lint.cjs` | Proje kurallari lint denetimi | Calisiyor |
| `scripts/run-all-tests.cjs` | Tum `test-*.cjs` dosyalarini tek komutla sirali calistirir | Calisiyor |
| `scripts/readiness-check.cjs` | Local test, build, gorsel audit, canli stamp ve cloud live durumunu tek raporda toplar | Hazir |
| `scripts/final-live-validation.cjs` | Auth settings, gercek cloud cok kullanici ve sifre reset API sonucunu tek final raporda toplar | Env/secret gerektirir |
| `scripts/final-live-validation.ps1` | Windows'ta reset e-posta, iki test hesabi veya service role key bilgisini guvenli prompt ile alip final canli dogrulamayi calistirir | Hazir |
| `scripts/cloud-live-smoke.cjs` | Iki gercek Supabase kullanicisiyle ortak proje, hareket ve bildirim cloud smoke testi; service role varsa gecici test hesabi uretir | Env/secret gerektirir |
| `scripts/cloud-live-smoke.ps1` | Windows'ta iki test hesabi veya service role key bilgisini guvenli prompt ile alip cloud live smoke testini calistirir | Hazir |
| `scripts/cdp-test-harness.cjs` | Playwright bagimliligi olmadan gercek Chrome/CDP browser testleri | Calisiyor |
| `vercel.json` | Vercel build/output ve header ayarlari | `npm run build` + `public` output ayarli |
| `api/tcmb-rate.js` | Doviz hareketleri icin TCMB kur proxy endpoint'i | Syntax kontrolu gecti |
| `build-public.cjs` | Deploy icin statik public klasoru uretimi | Calisiyor |
| `KASAM-RULES.md` | Urun ve kod kurallari | Guncel |
| `KASAM-OWNER-PROFILE.md` | Proje sahibi tercihleri | Guncel |
| `CODEX-CONTEXT.md` | Codex gorev protokolu | Guncel |

## Ozellik Listesi
| Ozellik | Durum | Aciklama |
|---|---|---|
| Temel kasa gelir/gider/bakiye | Calisiyor | Node testlerinde geciyor |
| Ortak butce ve pay hesabi | Calisiyor | Model, simulator ve browser ledger testleri geciyor |
| Ortak hareketin cloud alanlari | Calisiyor | `paidById`, `splitWith`, `splitRatio`, `rateLockedAt`, `autoRevealAt`, `updatedAt` cloud read/write icinde korunuyor |
| Kisisel kasaya pay yansimasi | Calisiyor | Shared budget ve browser entry flow testleri geciyor |
| Bildirimlerin alicilara dusmesi | Calisiyor | Simulator PASS/FAIL kontrolleri ve acik hareket browser testi geciyor |
| Realtime cloud yenileme | Calisiyor | Kullanici degisiminde eski kanal kapanir; realtime, online ve uygulamaya geri donus refresh tetikler |
| Duplicate hareket engeli | Calisiyor | Ayni submit akisindan tek entry ve tek notification uretiliyor |
| Hareket silme | Calisiyor | Hareketi ekleyen kullanici silebilir; bildirim ve tepkiler temizlenir |
| Acik hareket medya overlay | Calisiyor | GIF/fotograf hareket kartindan buyuk overlay olarak aciliyor |
| memberSince tarihi | Calisiyor | Test kapsiyor |
| Surpriz bildirim oyunu - 3 asamali | Calisiyor | Oyun bitmeden detay gizli, tamamlaninca aciliyor |
| Aktore surpriz sayaci gizleme | Calisiyor | Hareketi ekleyen kisi bekleyen surpriz sayaci gormez |
| Tahmin skoru ve tanisma skoru | Calisiyor | `test-game-v2.cjs` kapsiyor |
| Tepki/medya sistemi | Calisiyor | Medya secici, sticker fallback ve bildirim gecmisi reel tarayici audit kapsaminda gecti |
| Ses sistemi | Calisiyor | Mock test geciyor |
| Test senaryosu auth bypass | Calisiyor | `testScenario` ve `simUser` akislari dogrulandi |
| Cok kullanici simulator | Calisiyor | Ortak hareket, bildirim alicilari, kisisel pay ve oyun gizliligi PASS/FAIL verir |
| Tab bar 5 sekme | Calisiyor | UI ve gorsel testlerde geciyor |
| Renk/kontrast kurallari | Calisiyor | `kasam-lint.cjs` kontrol ediyor |
| Doviz kur kilidi | Calisiyor | Non-TL hareketlerde TCMB proxy ve locked exchange rate akisi var |
| Sifre sifirlama UI | Kodda hazir | Supabase mail teslimi proje SMTP/rate ayarlarina bagli |
| PWA kurulumu | Manuel dogrulandi | Kullanici iOS kurulumunu manuel test etti |
| Supabase RLS | SQL hazir | Dashboard uygulanma durumu kullanici ortaminda dogrulanmali |

## Veri Semasi
| Tablo | Amac | RLS Durumu |
|---|---|---|
| `kasa_profiles` | Kullanici profilleri | SQL policy dosyalarinda tanimli |
| `kasa_projects` | Kisisel ve ortak kasalar | SQL policy dosyalarinda tanimli |
| `kasa_project_members` | Ortak kasa uyelikleri ve uye bazli alanlar | SQL policy dosyalarinda tanimli |
| `kasa_entries` | Gelir/gider hareketleri | SQL policy dosyalarinda tanimli; ortak pay alanlari tasiniyor |
| `kasa_notifications` | Bildirim ve oyun verisi | Game V2 migration ile genisletildi |
| `kasa_reactions` | Hareket tepkileri | SQL policy dosyalarinda tanimli |
| `kasa_goals` | Hedef/kumbara | SQL policy dosyalarinda tanimli |
| `kasa_settlements` | Hesaplasma kayitlari | SQL policy dosyalarinda tanimli |
| `kasa_reconciliations` | Ekstre uzlasmasi | SQL policy dosyalarinda tanimli |

## Bilinen Sinirlar
- Kod tarafinda realtime abonelik, kullanici degisimi kanal temizligi ve online/visibility fallback refresh eklendi; gercek Supabase ortaminda iki ayri fiziksel cihazla gecikme/push davranisi yine ayrica izlenmeli.
- PWA icinden iOS/WhatsApp native sticker paketleri dogrudan listelenemez; paste/file fallback kullanilir.
- Supabase sifre sifirlama mailinin ulasmasi Supabase Auth mail ayarlari, rate limit ve SMTP durumuna baglidir.

## Test Durumu
| Test | Sonuc |
|---|---|
| `kasam-lint.cjs` | 12 fail kurali geciyor; KURAL-025/KURAL-026 WARN kontrolleri raporlanir |
| `test-kasa-e2e.cjs` | 21 test, 21 gecti, 0 basarisiz |
| `test-game-v2.cjs` | 22 test, 22 gecti, 0 basarisiz |
| `test-ui-fixes.cjs` | 22 test, kritik production katmanini ve realtime refresh fallback akisini kontrol eder |
| `test-simulator.cjs` | 9 test, 9 gecti, 0 basarisiz |
| `test-password-reset.cjs` | 11 test, 11 gecti, 0 basarisiz |
| `test-shared-budget-sync.cjs` | PASS |
| `test-yilmaz-scenario-rhythm.cjs` | PASS |
| `test-cloud-persistence-and-guess-flow.cjs` | PASS |
| `test-entry-open-flow.cjs` | PASS: Chrome/CDP ile tek kayit, tek bildirim, ortak pay ve GIF overlay dogrulandi |
| `test-shared-ledger.cjs` | PASS: Chrome/CDP ile ortak gider/gelir split, kisisel pay ve bildirim dogrulandi |
| `test-readiness-check-script.cjs` | PASS: readiness komutu, canli stamp ve cloud live env kapisi statik olarak dogrulandi |
| `scripts/run-all-tests.cjs` | PASS: 29 test dosyasi, 29 gecti, 0 basarisiz |
| `scripts/readiness-check.cjs` | LOCAL/GORSEL/CLOUD STAMP gecitlerini tek raporda toplar; cloud env yoksa CLOUD LIVE MULTI-USER icin PASS yazmaz |
| `scripts/cloud-live-smoke.cjs` | Hazir: gercek iki test hesabi veya local-only service role env verilince Supabase Auth + REST + RLS akisini dogrular |
| `build-public.cjs` | PASS: public klasoru hazir |
| `api/tcmb-rate.js` | PASS: syntax kontrolu |

## Son Guncelleme: Readiness Check Kapisi - 2026-06-21
- `scripts/readiness-check.cjs` eklendi. `npm run check:ready` komutu `kasam-lint.cjs`, tum local testler, `build-public.cjs`, `scripts/visual-audit.cjs`, canli Vercel stamp ve gercek cloud live smoke kapisini tek Markdown raporunda toplar.
- `test-readiness-check-script.cjs` eklendi; readiness komutunun canli canonical URL, guncel stamp ve iki hesapli cloud smoke env degiskenlerini kontrol ettigi dogrulandi.
- LOCAL SIMULASYON: `kasam-lint.cjs` 12/12 gecti; `scripts/run-all-tests.cjs` 29/29 test dosyasini gecirdi; `build-public.cjs` 41 dosyalik public klasorunu uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 kontrolu gecti.
- CLOUD TEST: Canli Vercel stamp dogrulandi: `Guncellendi 14.06.2026 23:05`. Gercek iki hesapli cloud smoke test env olmadigi icin bilincli olarak PASS uretmedi.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210237` (Windows kullanici klasoru ekranda Turkce karakterli gorunebilir).
- Readiness raporu: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\readiness-202606210236` (cloud live env eksigi raporda FAIL olarak yazilir).

## Son Guncelleme: Cloud Live Self-Provision Modu - 2026-06-21
- `scripts/cloud-live-smoke.cjs` artik iki modla calisir: mevcut iki gercek test hesabi env'i veya local-only `KASAM_SUPABASE_SERVICE_ROLE_KEY`.
- Service role modu iki gecici Supabase Auth kullanicisi olusturur, email_confirm ile login edilebilir hale getirir, ortak proje/hareket/bildirim testini calistirir, test projesini ve gecici auth kullanicilarini temizler.
- `scripts/cloud-live-smoke.ps1` service role key'i guvenli prompt ile alabilir; key dosyaya, repoya veya frontend'e yazilmaz.
- LOCAL SIMULASYON: `kasam-lint.cjs`, `test-cloud-live-smoke-script.cjs`, `test-readiness-check-script.cjs`, `scripts/run-all-tests.cjs` gecti. Son kosum: 29 test dosyasi, 29 gecti, 0 basarisiz; `build-public.cjs` 41 dosya uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 kontrolu gecti.
- CLOUD TEST: Canli Vercel stamp dogrulandi: `Guncellendi 14.06.2026 23:05`. Secret/env verilmediginde cloud live multi-user script exit code 2 ile durdu ve PASS uretmedi. Gercek cloud PASS icin iki test hesabi veya local service role key ile kosum gerekir.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210257` (Windows kullanici klasoru ekranda Turkce karakterli gorunebilir).
- Readiness raporu: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\readiness-202606210257` (cloud live env eksigi raporda FAIL olarak yazilir).

## Son Guncelleme: Gorsel Kanit Ciktilari Repo Disina Alindi - 2026-06-21
- `test-kasam-screenshot-scenarios.cjs` artik her kosumda takip edilen `screenshots/kasam-senaryo-testleri` dosyalarini degistirmez.
- Senaryo ekran goruntuleri KURAL-027 ile uyumlu olarak `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\scenario-screenshots-[tarih]` klasorune yazilir.
- LOCAL SIMULASYON: `kasam-lint.cjs` gecti; `test-kasam-screenshot-scenarios.cjs` 7/7 gecti; `scripts/run-all-tests.cjs` 29/29 test dosyasini gecirdi; `build-public.cjs` 41 dosya uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 kontrolu gecti.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\scenario-screenshots-202606210308` ve `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210308`.

## Son Guncelleme: Realtime Refresh Eksiklerinin Kapatilmasi
- Eksik istek listesi icinde kalan ortak kasa senkronu yeniden denetlendi.
- `app-critical-fixes.js` icinde realtime kanali aktif kullaniciya baglandi; kullanici degisince eski kanal kapatilir.
- `kasa_entries`, `kasa_notifications`, `kasa_projects`, `kasa_project_members`, `kasa_profiles` degisiklikleri artik tek refresh kuyruguna duser; ayni anda gelen olaylar state'i tekrar tekrar ezmez.
- Uygulama tekrar internete geldiginde ve arka plandan one dondugunde cloud verisi yeniden yuklenir.
- LOCAL SIMULASYON: `kasam-lint.cjs`, `test-ui-fixes.cjs`, `test-kasa-e2e.cjs`, `test-game-v2.cjs`, `test-simulator.cjs`, `test-password-reset.cjs`, `test-shared-budget-sync.cjs`, `test-cloud-persistence-and-guess-flow.cjs`, `test-yilmaz-scenario-rhythm.cjs`, `test-entry-open-flow.cjs`, `test-shared-ledger.cjs`, `build-public.cjs` gecti.
- GORSEL DOGRULAMA: 14 kontrol, 14 gecti, 0 basarisiz.
- CLOUD TEST: canli Vercel stamp goruldu: `Guncellendi 14.06.2026 23:05`.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606202031` (Windows kullanici klasoru ekranda Turkce karakterli gorunebilir).

## Son Guncelleme: Eksik Istek Denetimi
- Eski istek listesi aktif production katmanina gore tekrar denetlendi.
- `test-ui-fixes.cjs` artik sadece eski `app-ui-fixes.js` dosyasini degil, production'da yuklenen `app-critical-fixes.js` ve `kasam-critical-fixes.css` katmanlarini da kontrol eder.
- Ek kontroller: bos bildirim metni, aktore surpriz sayaci gizleme, tutar placeholder temizligi, TCMB kur proxy, cift kayit engeli, hareket silme, kisisel kasa tekillestirme, aktif/gecmis bildirim ayrimi.

## Son Guncelleme: Eksik Istek Denetimi ve Browser Testleri
- Playwright bagimliligi nedeniyle calismayan iki browser testi Chrome DevTools Protocol tabanli hale getirildi.
- `test-entry-open-flow.cjs`: acik hareket ekleme, cift submit engeli, tek bildirim, ortak pay ve GIF overlay akisi gercek tarayicida dogrulandi.
- `test-shared-ledger.cjs`: ortak kasaya gider ve gelir ekleme, `splitWith/splitRatio`, iki kullanici kisisel paylari ve bildirim alicisi gercek tarayicida dogrulandi.
- LOCAL SIMULASYON: `kasam-lint.cjs`, `test-ui-fixes.cjs`, `test-kasa-e2e.cjs`, `test-game-v2.cjs`, `test-simulator.cjs`, `test-password-reset.cjs`, `test-shared-budget-sync.cjs`, `test-cloud-persistence-and-guess-flow.cjs`, `test-yilmaz-scenario-rhythm.cjs`, `test-entry-open-flow.cjs`, `test-shared-ledger.cjs`, `build-public.cjs` gecti.
- GORSEL DOGRULAMA: 14 kontrol, 14 gecti, 0 basarisiz.
- CLOUD TEST: canli Vercel stamp goruldu: `Guncellendi 14.06.2026 23:05`.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606202001` (Windows kullanici klasoru ekranda Turkce karakterli gorunebilir).

## Onceki Guncelleme: Bildirim Gecmisi ve Reel Gorsel Audit
- Aktif tahmin oyunu bildirimleri gecmis bildirimlerden ayrildi; aktif oyun karti ustte kalir, gecmis bildirimler acilir/kapanir gecmis alanina tasinir.
- Bildirim gizlilik kontrolu artik tum sayfayi degil aktif oyun kartini denetler; eski acik bildirimler aktif surpriz gizliligi testini bozmaz.
- Kisisel kasa listesinde ayni kullaniciya ait yinelenen kisisel kasa kartlari tekillestirildi.
- Kisisel kasa detayinda erisim/katilma talebi bolumleri gizlenir; ortak kasada paylasim ve katilma talebi akisi korunur.
- LOCAL SIMULASYON: `kasam-lint.cjs`, `test-ui-fixes.cjs`, `test-game-v2.cjs` gecti.
- GORSEL DOGRULAMA: 14 kontrol, 14 gecti, 0 basarisiz.
- CLOUD TEST: canli Vercel stamp goruldu: `Guncellendi 14.06.2026 23:05`.
- Gorseller: `C:\Users\İRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606201910`.

## Sonraki Adimlar
1. Gercek Supabase tablolarinda `kasa_entries` ve `kasa_notifications` insert kayitlari iki farkli kullaniciyla dogrulanmali.
2. Supabase Auth mail teslimi icin SMTP/rate limit ayarlari kontrol edilmeli.
3. iPhone uzerinde medya secici ve bildirim oyunu UX'i tekrar gozle incelenmeli.

## Son Guncelleme: Sifre Sifirlama Canli API Kapisi - 2026-06-21
- `scripts/auth-settings-live-smoke.cjs` eklendi. Bu script Supabase `/auth/v1/settings` ve `/auth/v1/health` endpointleriyle email provider, signup ve GoTrue health durumunu kontrol eder.
- `scripts/password-reset-live-smoke.cjs` eklendi. Bu script `KASAM_RESET_TEST_EMAIL` ile Supabase `/auth/v1/recover` isteginin canonical Vercel reset redirect'iyle kabul edilip edilmedigini kontrol eder.
- `scripts/password-reset-live-smoke.ps1` eklendi. Windows kullanicisindan test e-postasini prompt ile alir, env'e gecici yazar ve testi calistirir.
- `npm run test:password-reset-live` ve `npm run test:password-reset-live:prompt` komutlari eklendi.
- `npm run test:auth-settings-live` komutu eklendi.
- `scripts/readiness-check.cjs` artik `CLOUD AUTH SETTINGS` ve `CLOUD PASSWORD RESET API` satirlarini ayri raporlar. E-posta env eksikse reset API icin WARN yazar; env verilip API hata verirse readiness FAIL olur.
- Onemli ayrim: API kabulu mail teslimi demek degildir. Inbox/spam kontrolu kullanici tarafindan yapilir.
- LOCAL SIMULASYON: `kasam-lint.cjs`, `test-password-reset-live-smoke-script.cjs`, `test-readiness-check-script.cjs`, `scripts/run-all-tests.cjs` gecti. Son kosum: 30 test dosyasi, 30 gecti, 0 basarisiz; `build-public.cjs` 41 dosya uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 gecti.
- CLOUD TEST: Canli Vercel stamp dogrulandi: `Guncellendi 14.06.2026 23:05`. `KASAM_SUPABASE_SERVICE_ROLE_KEY` veya iki gercek test hesabi env'i olmadigi icin `CLOUD LIVE MULTI-USER` PASS uretemedi. `KASAM_RESET_TEST_EMAIL` olmadigi icin `CLOUD PASSWORD RESET API` WARN olarak raporlandi.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210326`.
- Readiness raporu: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\readiness-202606210326`.

## Son Guncelleme: Auth Settings Canli Kapisi - 2026-06-21
- `scripts/auth-settings-live-smoke.cjs` readiness akisina baglandi.
- LOCAL SIMULASYON: `kasam-lint.cjs`, `test-auth-settings-live-smoke-script.cjs`, `test-password-reset-live-smoke-script.cjs`, `test-readiness-check-script.cjs`, `scripts/run-all-tests.cjs` gecti. Son kosum: 31 test dosyasi, 31 gecti, 0 basarisiz; `build-public.cjs` 41 dosya uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 gecti.
- CLOUD TEST: Supabase auth settings PASS (`email provider: enabled`, `signup disabled: no`, GoTrue health OK). Canli Vercel stamp PASS. `CLOUD LIVE MULTI-USER` ve `CLOUD PASSWORD RESET API` hala ilgili env/test girdileri olmadan PASS uretemez.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210335`.
- Readiness raporu: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\readiness-202606210336`.

## Son Guncelleme: Final Canli Dogrulama Kapisi - 2026-06-21
- `scripts/final-live-validation.cjs` eklendi. Tek kosumda `CLOUD AUTH SETTINGS`, `CLOUD MULTI-USER` ve `CLOUD PASSWORD RESET API` sonucunu raporlar.
- `scripts/final-live-validation.ps1` eklendi. Windows'ta reset e-postasi, iki gercek test hesabi veya service role key bilgisini prompt ile alir; secret degerleri dosyaya yazmaz.
- `npm run test:final-live` ve `npm run test:final-live:prompt` eklendi.
- Eksik test hesabi/service role veya reset e-posta varsa final rapor `NEEDS_INPUT` yazar ve PASS saymaz.
- LOCAL SIMULASYON: `test-final-live-validation-script.cjs` final gate'in script baglantilarini, NEEDS_INPUT davranisini ve secure prompt kullanimini statik olarak dogrular.

## Son Guncelleme: Tek Canonical Uygulama Paketi - 2026-06-21
- Eski Netlify upload kopyasi repodan kaldirildi; bu klasor build'e girmiyordu ama iki prototip algisi ve eski URL riski olusturuyordu.
- `index.html` tarafindan yuklenmeyen eski monolit `app.js` kaldirildi. Canonical uygulama artik sadece `index.html` icindeki moduler dosya sirasi ve `app-critical-fixes.js` production katmanidir.
- `build-public.cjs`, `sw.js`, `test-offline.cjs` ve `test-kasam-production.cjs` aktif moduler paketle uyumlu hale getirildi.
- `KURAL-052` eklendi: eski prototip kopyasi, `netlify-upload`, eski Netlify hostlari veya `app.js` bundle referansi geri gelirse lint FAIL verir.
- LOCAL SIMULASYON: `kasam-lint.cjs` 13/13 gecti; `scripts/run-all-tests.cjs` 32/32 test dosyasini gecirdi; `build-public.cjs` 40 dosyalik canonical public paketini uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 gecti. Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210436`.
- CLOUD TEST: Auth settings ve canli stamp PASS (`Guncellendi 14.06.2026 23:05`). Gercek cloud multi-user ve password reset API, test girdileri olmadigi icin `NEEDS_INPUT` durumunda. Readiness raporu: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\readiness-202606210437`; final rapor: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\final-live-validation-202606210438`.

## Son Guncelleme: Kalite Kapilarinin Tek Komuta Baglanmasi - 2026-06-21
- `scripts/run-all-tests.cjs` eklendi; artik `npm test` ve `npm run test:all` tum `test-*.cjs` dosyalarini calistirir.
- `npm run test:visual` Playwright CLI yerine mevcut Chrome/CDP tabanli `scripts/visual-audit.cjs` auditini calistirir; Playwright ayrica `npm run test:playwright` olarak korunur.
- `scripts/cdp-test-harness.cjs` ve `scripts/visual-audit.cjs` tarayici exception mesajlarini artik gercek hata aciklamasiyla raporlar.
- LOCAL SIMULASYON: `kasam-lint.cjs` 12/12 gecti; `scripts/run-all-tests.cjs` 28/28 test dosyasini gecirdi; `build-public.cjs` 41 dosyalik public klasorunu uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 kontrolu gecti.
- CLOUD TEST: canli Vercel HTML icinde `Guncellendi 14.06.2026 23:05` ve `app-critical-fixes.js?v=20260614-2305` dogrulandi.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210141` (Windows kullanici klasoru ekranda Turkce karakterli gorunebilir).

## Son Guncelleme: Gercek Cloud Smoke Kapisi - 2026-06-21
- `scripts/cloud-live-smoke.cjs` eklendi. Bu script iki ayri gercek Supabase kullanicisiyla giris yapar, test ortak kasa olusturur, uyelik/hareket/bildirim yazar, ikinci kullanicidan okur ve test projesini silerek temizler.
- `npm run test:cloud-live` komutu eklendi. Sifreler koda yazilmaz; `KASAM_CLOUD_EMAIL_A`, `KASAM_CLOUD_PASSWORD_A`, `KASAM_CLOUD_EMAIL_B`, `KASAM_CLOUD_PASSWORD_B` env degiskenleri gerekir.
- Eksik env varsa script exit code 2 ile durur ve PASS uretmez. Bu, KURAL-046 icin local simulator ile gercek cloud kanitini ayirir.
- LOCAL SIMULASYON: Statik script testi `test-cloud-live-smoke-script.cjs` ile cloud live scriptin Auth/REST/env/cleanup davranisi denetlenir.
- CLOUD TEST: Bu turda kullanici test hesap sifreleri verilmedigi icin gercek iki hesapli cloud run henuz calistirilmadi.

## Son Guncelleme: Cloud Test Kapisi ve CDP Stabilizasyonu - 2026-06-21
- `scripts/cdp-test-harness.cjs` artik sayfa acildiktan sonra `normalizeState`, `makeDraft` ve `render` fonksiyonlari hazir olana kadar bekler. Bu, browser testlerinin uygulama yuklenmeden baslamasini engeller.
- `scripts/cloud-live-smoke.cjs` env degiskenleri yokken bilincli olarak durur; gercek iki test hesabi olmadan cloud PASS yazmaz.
- LOCAL SIMULASYON: `kasam-lint.cjs` 12/12 gecti; `scripts/run-all-tests.cjs` 28/28 test dosyasini gecirdi; `build-public.cjs` 41 dosyalik public klasorunu uretti.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` 14/14 kontrolu gecti.
- CLOUD TEST: Canli Vercel stamp dogrulandi: `Guncellendi 14.06.2026 23:05`. Gercek iki hesapli Supabase yaz/oku testi env hesaplari verilmedigi icin henuz calistirilmadi.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210206` (Windows kullanici klasoru ekranda Turkce karakterli gorunebilir).

## Son Guncelleme: Cloud Live Smoke Prompt Runner - 2026-06-21
- `scripts/cloud-live-smoke.ps1` eklendi. Windows kullanicisindan iki test hesabi e-posta/sifresini guvenli prompt ile alir, env degiskenlerine gecici yazar ve `scripts/cloud-live-smoke.cjs` testini calistirir.
- `npm run test:cloud-live:prompt` komutu eklendi. Bu komut sifreyi repoya, terminal gecmisine veya dokumana yazmayi gerektirmez.
- LOCAL SIMULASYON: `test-cloud-live-smoke-script.cjs` prompt runner'in secure prompt kullandigini ve hardcoded test credential icermedigini kontrol eder.
- CLOUD TEST: Prompt runner hazir; gercek iki hesapla calistirma kullanici tarafinda yapilacak.
- SON KOSUM: `kasam-lint.cjs` 12/12 gecti; `scripts/run-all-tests.cjs` 28/28 gecti; `build-public.cjs` 41 dosya uretti; `scripts/visual-audit.cjs` 14/14 gecti.
- SON CLOUD DURUMU: Canli Vercel stamp dogrulandi: `Guncellendi 14.06.2026 23:05`; gercek iki hesapli cloud smoke test env olmadigi icin bilincli olarak PASS uretmedi.
- Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\visual-test-202606210221` (Windows kullanici klasoru ekranda Turkce karakterli gorunebilir).

## Son Guncelleme: Eksik Istek Testlerinin Stabilize Edilmesi - 2026-06-21
- Eksik istek listesinden kalan test borclari yeniden denetlendi.
- `entriesForPeriod()` tarih filtresi yerel gun anahtariyla hizalandi; gunluk/haftalik/aylik raporlarda UTC kaynakli gun kaymasi kapatildi.
- `scripts/cdp-test-harness.cjs` Chrome/CDP testleri icin stabil `--single-process --no-sandbox` profile guncellendi; port doluysa sonraki bos porta dusuyor.
- `test-scenarios.cjs` ve `scripts/visual-audit.cjs` Desktop klasorune yazamadiginda workspace icindeki `screenshots/` altina guvenli fallback kullaniyor.
- Browser tabanli testler Playwright paketine bagimli olmadan CDP ile calisacak hale getirildi.
- LOCAL SIMULASYON: Tum `test-*.cjs` dosyalari calistirildi: 28 test dosyasi, 28 gecti, 0 basarisiz.
- LOCAL SIMULASYON EK: `kasam-lint.cjs` 12/12 gecti; `build-public.cjs` 41 dosyalik `public` klasorunu uretmeyi basardi.
- GORSEL DOGRULAMA: `scripts/visual-audit.cjs` yerel 13 UI kontrolunu gecti ve ekran goruntulerini olusturdu.
- CLOUD TEST: Canli Vercel stamp kontrolu bu turda basarisiz; beklenen `Guncellendi 14.06.2026 23:05` canli sayfada gorunmedi. Bu commit push edilip Vercel deploy tamamlandiktan sonra tekrar dogrulanacak.
- Gorseller: `screenshots/visual-test-202606210059/` ve `screenshots/kasam-senaryo-testleri/`.
