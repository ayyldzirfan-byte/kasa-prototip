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

## Son Guncelleme: Commercial Supabase Auth/Cloud Baglantisi - 2026-06-21
- Commercial Next.js uygulamasi artik `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` varsa auth ekranindan gercek Supabase oturumu acar; env yoksa demo moduna duser.
- Giris, kayit, sifremi unuttum, `/auth/callback` ve yeni sifre olusturma ekrani commercial app icinde kurgulandi.
- Commercial cloud acilisinda kullanicinin `kasa_profiles` kaydi ve hic uyeligi yoksa kisisel kasa starter kaydi olusturulur.
- Commercial hareket ekleme akisi gercek `kasa_entries` tablosuna yazar; surpriz modunda production semasinin zorunlu `actual_type`, `title`, `amount`, `success_reaction`, `fail_reaction`, `guesses` alanlari doldurulur.
- `supabase-commercial-complete-guess.sql` eklendi. Tahmin oyunu tamamlaninca bildirimi ve bagli hareketi tek RPC ile acar; RLS nedeniyle production icin Supabase SQL Editor'da calistirilmesi gerekir.
- Commercial Vercel project env'leri eklendi: `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` Production/Preview/Development ortamlarinda mevcut.
- Commercial production yeniden deploy edildi ve `https://commercial-smoky.vercel.app` alias'i yeni deploy'a baglandi.
- LOCAL SIMULASYON: Commercial Jest 14/14 gecti; TypeScript typecheck gecti; Next build gecti; `test-commercial-vercel-config.cjs` 4/4 gecti; `test-commercial-cloud-adapter.cjs` 7/7 gecti; `kasam-lint.cjs` 14/14 gecti.
- GORSEL DOGRULAMA: Commercial Playwright 5/5 gecti. Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual-20260621-connect`. Canli commercial auth/env ekrani da Playwright ile goruldu: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\commercial-live-20260621-connect`.
- CLOUD TEST: Commercial cloud adapter statik testi gecti. Commercial canli URL env ile auth ekranina dusuyor ve demo moda dusmuyor. Gercek Supabase live multi-user smoke bu turda secret kullanmadan tekrar calistirilmadi; once `supabase-commercial-complete-guess.sql` calistirilmali, sonra `npm.cmd run commercial:cloud-smoke:prompt` ile tekrar PASS alinmali.

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

## Son Guncelleme: Vercel Deploy Build Ayrimi - 2026-06-21
- Vercel production build komutu `npm run vercel-build` olarak ayrildi.
- `vercel-build` yalnizca `node build-public.cjs` calistirir ve `public` klasorunu uretir.
- Local kalite kapilari korunur: `node kasam-lint.cjs`, `node scripts/run-all-tests.cjs`, `node scripts/visual-audit.cjs` ve gerekli cloud smoke testleri deploydan once ayri kosulur.
- `KURAL-053` eklendi: Vercel build komutu local test/lint kapilarini calistirirsa `kasam-lint.cjs` FAIL verir.
- Sebep: Son Vercel deploylari production build icinde tum test zinciri kosuldugu icin 5 saniyede Error'a dusuyordu ve canli surum eski kalma riski tasiyordu.

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

## Son Guncelleme: Ticari Rebuild V1 Izole Iskelet - 2026-06-21
- `commercial/` altinda Next.js 15 + TypeScript + Tailwind v4 tabanli izole ticari app iskeleti eklendi.
- Ticari PRD ve bilgi mimarisi `commercial/docs/PRD.md` ve `commercial/docs/INFORMATION-ARCHITECTURE.md` dosyalarina yazildi.
- `commercial/src/lib/domain.ts` kisinin kendi kasasina etki, ortak kasa kumulatifi, surpriz gizliligi ve minimum transfer hesaplarini icerir.
- `commercial/src/components/KasamCommercialApp.tsx` MVP+ ekranlarini icerir: Ana ekran, Hareketler, Butceler, Takvim, Rapor, hareket ekleme ve tahmin oyunu gizliligi.
- Kok production Vercel build akisi degistirilmedi; ticari app izole gelistirilir.
- LOCAL SIMULASYON: `test-commercial-rebuild.cjs` 14/14 gecti; `kasam-lint.cjs` 14/14 gecti; `commercial` Jest 10/10 gecti; `commercial` TypeScript typecheck gecti; `commercial` Next build gecti; `scripts/run-all-tests.cjs` 33/33 test dosyasini gecirdi; `build-public.cjs` mevcut production PWA icin `public` klasorunu uretti.
- GORSEL DOGRULAMA: `commercial/tests/visual-rules.spec.ts` 5/5 gecti. Ekran goruntuleri `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual` klasorune yazilir; Playwright hata kanitlari `commercial/screenshots/commercial-playwright` altindadir.
- CLOUD TEST: Yeni Next app henuz Supabase cloud smoke'a baglanmadi; mevcut production PWA cloud smoke kapisi korunur. Ticari app cloud kaniti icin commercial Supabase client ve Vercel root stratejisi sonraki bloktur.

## Son Guncelleme: Ticari Rebuild Cloud Adapter - 2026-06-21
- `commercial/src/lib/cloud-schema.ts` eklendi. Supabase `kasa_profiles`, `kasa_projects`, `kasa_project_members`, `kasa_entries`, `kasa_notifications` satirlari commercial `AppState` modeline cevrilir.
- `commercial/src/lib/cloud-client.ts` eklendi. Commercial app icin `loadCommercialCloudState()` ve `createCommercialCloudEntry()` fonksiyonlari hazirlandi; frontend tarafina service role veya secret key yazilmaz.
- `commercial/src/__tests__/cloud-schema.test.ts` eklendi. Cloud satirlarindan ortak kasa pay etkisi, aktore surpriz sayaci gizleme, aliciya bildirim gorunurlugu ve gizli hareketin bakiyeden dusmemesi test edildi.
- `scripts/commercial-cloud-smoke.cjs` eklendi. Bu komut once mevcut gercek Supabase `cloud-live-smoke.cjs` kapisini, sonra commercial adapter smoke testini calistirir.
- `commercial:cloud-smoke` npm script'i eklendi. Gercek cloud PASS icin iki test hesabi veya local-only service role key gerekir.
- LOCAL SIMULASYON: Commercial Jest 14/14 gecti; TypeScript typecheck gecti; Next build gecti; `test-commercial-cloud-adapter.cjs` 5/5 gecti; `test-commercial-rebuild.cjs` 14/14 gecti; `kasam-lint.cjs` 14/14 gecti.
- GORSEL DOGRULAMA: `commercial/tests/visual-rules.spec.ts` 5/5 gecti. Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual`.
- CLOUD TEST: `npm.cmd run commercial:cloud-smoke:prompt` gercek Supabase service role ile calistirildi ve PASS verdi. Iki gecici Supabase auth kullanicisi olusturuldu; ortak proje ikinci kullanicida gorundu; ortak hareket ikinci kullanicida gorundu; `paid_by_id`, `split_with`, `split_ratio` korundu; bildirim ikinci kullaniciya dustu; gecici proje ve auth kullanicilari temizlendi. Commercial adapter smoke 6/6 gecti.

## Son Guncelleme: Commercial Ayrı Vercel Project Hazırlığı - 2026-06-21
- `commercial/vercel.json` eklendi. Commercial app ayri Vercel project olarak `Root Directory=commercial` ile deploy edilecek; framework `Next.js`, build `npm run build`, install `npm install`.
- `COMMERCIAL-VERCEL-SETUP.md` eklendi. Vercel dashboard adimlari, env degiskenleri, Supabase redirect notlari ve deploy kontrol listesi yazildi.
- `test-commercial-vercel-config.cjs` eklendi. Commercial Vercel config, root production PWA config ayrimi, env secret temizligi ve kurulum dokumani statik olarak denetlenir.
- `commercial:deploy-ready` npm script'i eklendi. Config, cloud adapter, commercial Jest, typecheck ve Next build tek kapida calistirilir.
- LOCAL SIMULASYON: `test-commercial-vercel-config.cjs` 4/4 gecti; `test-commercial-cloud-adapter.cjs` 6/6 gecti; Commercial Jest 14/14 gecti; TypeScript typecheck gecti; Next build gecti; `kasam-lint.cjs` 14/14 gecti.
- GORSEL DOGRULAMA: Commercial Playwright 5/5 gecti. Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual`.
- CLOUD TEST: Bir onceki commercial cloud smoke PASS sonucu korunuyor. Bu turda cloud verisine yeni yazim yapilmadi; deploy config ayrimi cloud semasini degistirmez.
## Son Guncelleme: Ticari Zeka Motoru V1 - 2026-06-21
- `commercial/src/lib/insights.ts` eklendi. Kullaniciyi yonlendiren oneriler deterministik ve test edilebilir saf fonksiyonlarla uretilir.
- Oneri tipleri: hedef gecikmesi, hedefi one alma, nakit akisi uyarisi, ortak kasanin kisisel kasaya etkisi ve kategori kisma onerisi.
- Ana ekrana kompakt `Kasam oneriyor` karti eklendi. Kart ilk oneriyi one cikarir, ek onerileri kalabalik yapmadan listeler.
- Demo state'e `Tatil hedefi` eklendi; hedef ve harcama etkisi test edilebilir hale geldi.
- `commercial/docs/INTELLIGENCE-ENGINE.md` eklendi. AI siniri belgelendi: AI finansal hesap yapmaz, sadece hesaplanmis sonucu anlatabilir.
- `KURAL-055` eklendi: Zeka motoru hesaplari deterministik yapar.
- LOCAL SIMULASYON: Commercial Jest 20/20 gecti; TypeScript typecheck gecti; Next build gecti; root toplu test kapisi 35/35 test dosyasi gecti.
- GORSEL DOGRULAMA: Commercial Playwright 5/5 gecti. Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual`.
- CLOUD TEST: Bu degisiklik cloud semasina yazim yapmadi; mevcut commercial cloud adapter ve onceki multi-user smoke sonucu korunuyor.

## Son Guncelleme: Commercial Supabase Tablo Eslemesi - 2026-06-21
- `commercial/src/lib/types.ts` commercial domain modeline production tablo alanlari eklendi: profil skor alanlari, project member alias/familiarity, project default currency/template, entry OCR/taksit/settlement, notification game v2, reaction, settlement, reconciliation ve insight tipleri.
- `commercial/src/lib/cloud-schema.ts` kolon-tam mapper katmanina cevrildi. `kasa_profiles`, `kasa_projects`, `kasa_project_members`, `kasa_entries`, `kasa_notifications`, `kasa_goals`, `kasa_reactions`, `kasa_settlements`, `kasa_reconciliations`, `kasa_insights` commercial state'e okunur.
- `commercial/src/lib/cloud-client.ts` opsiyonel tablolar icin guvenli okuma ekledi; eksik tablo cloud akisini dusurmez. Entry ve notification insert payload'lari tek builder uzerinden production kolon adlariyla uretilir.
- `commercial/docs/SUPABASE-MAPPING.md` eklendi. Supabase tablo -> commercial state eslemesi, doviz/TL kuralı, ortak kasa split kuralı ve surpriz gizliligi belgelendi.
- `KURAL-056` eklendi: Commercial Supabase eslemesi cift yonlu ve kolon-tam olur.
- Playwright local dev takilmasi icin yalnizca `?visualTest=1` ile calisan demo bypass eklendi; normal auth/cloud kullanimi etkilenmez.
- LOCAL SIMULASYON: `test-commercial-cloud-adapter.cjs` 9/9 gecti; `test-commercial-rebuild.cjs` 18/18 gecti; `kasam-lint.cjs` 14/14 gecti; Commercial Jest 4 suite / 24 test gecti; TypeScript typecheck gecti; Commercial Next build gecti; `test-commercial-vercel-config.cjs` 4/4 gecti.
- GORSEL DOGRULAMA: Commercial Playwright 5/5 gecti. Gorseller: `C:\Users\İRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual`.
- CLOUD TEST: Bu Codex shell'inde `KASAM_SUPABASE_SERVICE_ROLE_KEY` yoktu, bu nedenle gercek Supabase live smoke tekrar kosulmadi. Static commercial adapter testi PASS. Gercek cloud multi-user testi icin kullanici tarafinda `npm run commercial:cloud-smoke:prompt` kosulacak.
## Son Guncelleme: Commercial Visual Polish - 2026-06-21
- Commercial demo verisi eski/prototip hissi veren kisi ve kasa adlarindan arindirildi; demo ortak kasa adi `Ev Ortak Kasasi` oldu.
- Mobil layoutta alt tab bar'in son kartlari kapatmamasi icin phone frame ve screen stack bottom spacing artirildi.
- Visual testlere eski demo hareket adi sizmasi ve tab bar overlap kontrolu eklendi.
- LOCAL SIMULASYON: Commercial Jest 4 suite / 24 test gecti; TypeScript typecheck gecti; Commercial Next build gecti; commercial Vercel config 4/4 gecti; commercial cloud adapter 9/9 gecti; `kasam-lint.cjs` 14/14 gecti.
- GORSEL DOGRULAMA: Commercial Playwright 6/6 gecti. Gorseller: `C:\Users\IRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual`.
- CLOUD TEST: Kullanici tarafinda `commercial:cloud-smoke:prompt` service role ile calistirildi ve PASS verdi; ortak proje, ortak hareket, split, paid_by ve bildirim gercek Supabase uzerinde dogrulandi.

## Son Guncelleme: Commercial Admin Key ve Windows Runner - 2026-06-21
- `scripts/cloud-live-smoke.cjs` non-JWT Supabase admin keylerini daha denemeden reddetmez. Prompt artik legacy `service_role` JWT veya yeni `sb_secret` admin key ile denenebilir.
- `scripts/commercial-cloud-smoke.ps1` prompt etiketi `Supabase admin key (legacy service_role JWT or sb_secret)` olarak guncellendi.
- `scripts/commercial-deploy-ready.cjs` ve `scripts/commercial-deploy-ready.ps1` eklendi. Windows PowerShell'de `node` PATH'i Codex paketindeki erisilemeyen node'a dusse bile gercek Node.js yolu ile deploy-ready kapisi calisir.
- `commercial:deploy-ready` npm script'i PowerShell wrapper uzerinden calisir.
- LOCAL SIMULASYON: `npm.cmd run commercial:deploy-ready` gecti; commercial Vercel config 4/4, commercial cloud adapter 9/9, Commercial Jest 4 suite / 24 test, TypeScript typecheck ve Next build PASS.
- GORSEL DOGRULAMA: Bu degisiklik UI degisikligi icermedi; mevcut Commercial Playwright 6/6 kaniti korunuyor.
- CLOUD TEST: Kullanici tarafinda yeni Supabase admin key ile `npm.cmd run commercial:cloud-smoke:prompt` kosuldu ve PASS verdi. Iki gecici Supabase auth kullanicisi olusturuldu; ortak proje, ortak hareket, `paid_by_id`, `split_with`, `split_ratio` ve bildirim akisi gercek cloud uzerinde dogrulandi; gecici proje ve auth kullanicilari temizlendi. Legacy `eyJ...` key bu konusmada gorundugu icin Supabase tarafinda rotate/iptal edilmeli.
