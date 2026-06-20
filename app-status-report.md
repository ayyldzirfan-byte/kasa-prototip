# Kasam - Uygulama Durum Raporu
Tarih: 2026-06-20

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
| `app-critical-fixes.js` | Kayit kilidi, duplicate engeli, medya overlay, kritik akis duzeltmeleri | Aktif production katmani |
| `app-game-v2.js` | 3 asamali tahmin oyunu | Testleri geciyor |
| `app-test-scenarios.js` | Test senaryosu ve auth bypass | Calisiyor |
| `kasam-simulator.html` | Cok kullanici iframe simulasyonu | Calisiyor, PASS/FAIL kontrolleri var |
| `kasam-lint.cjs` | Proje kurallari lint denetimi | Calisiyor |
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
- Gercek Supabase ortaminda iki ayri fiziksel cihazla realtime gecikme ve push davranisi ayrica izlenmeli.
- PWA icinden iOS/WhatsApp native sticker paketleri dogrudan listelenemez; paste/file fallback kullanilir.
- Supabase sifre sifirlama mailinin ulasmasi Supabase Auth mail ayarlari, rate limit ve SMTP durumuna baglidir.

## Test Durumu
| Test | Sonuc |
|---|---|
| `kasam-lint.cjs` | 12 fail kurali geciyor; KURAL-025/KURAL-026 WARN kontrolleri raporlanir |
| `test-kasa-e2e.cjs` | 21 test, 21 gecti, 0 basarisiz |
| `test-game-v2.cjs` | 22 test, 22 gecti, 0 basarisiz |
| `test-ui-fixes.cjs` | 20 test, kritik production katmanini da kontrol eder |
| `test-simulator.cjs` | 9 test, 9 gecti, 0 basarisiz |
| `test-password-reset.cjs` | 11 test, 11 gecti, 0 basarisiz |
| `test-shared-budget-sync.cjs` | PASS |
| `test-yilmaz-scenario-rhythm.cjs` | PASS |
| `test-cloud-persistence-and-guess-flow.cjs` | PASS |
| `test-entry-open-flow.cjs` | PASS: Chrome/CDP ile tek kayit, tek bildirim, ortak pay ve GIF overlay dogrulandi |
| `test-shared-ledger.cjs` | PASS: Chrome/CDP ile ortak gider/gelir split, kisisel pay ve bildirim dogrulandi |
| `build-public.cjs` | PASS: public klasoru hazir |
| `api/tcmb-rate.js` | PASS: syntax kontrolu |

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
