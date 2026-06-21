# Kasam — Codex Bağlam Dosyası
Son güncelleme: 2026-06-14

## Göreve Başlama Protokolü
1. `KASAM-RULES.md` oku.
2. `KASAM-OWNER-PROFILE.md` oku.
3. `app-status-report.md` oku.
4. `CODEX-CONTEXT.md` oku.
5. Görevi al.
6. “Bu görev daha önce yapılan bir şeyle çelişiyor mu?” kontrol et.
7. Çelişiyorsa belirt, sonra uygulanabilir kısmı yap.
8. Komutun çalışması yeterli kabul edilmez; verilen komut doğru problemi çözüyor mu ve aynı ekran/bileşen ailesinde yeni görsel ya da mantıksal bozulma üretiyor mu kontrol edilir.

## Teknoloji Stack
- Frontend: Vanilla JS PWA, CSS custom properties.
- Backend: Supabase Auth, Database, Realtime ve Storage yaklaşımı.
- Deploy: Vercel.
- Test: Node.js `.cjs` dosyaları; toplu kapı `scripts/run-all-tests.cjs`.
- Lint: `kasam-lint.cjs`; `pretest` ve `prebuild` öncesi çalışır.

## Dosya Yükleme Sırası
Bu sıra değiştirilmez:

1. `cloud-config.js`
2. Supabase CDN
3. `html2canvas`
4. `app-state.js`
5. `app-core.js`
6. `app-views.js`
7. `app-bind.js`
8. `app-model.js`
9. `app-cloud.js`
10. `app-blocks.js`
11. `app-product-pass.js`
12. `app-production.js`
13. `app-sounds.js`
14. `app-game-v2.js`
15. `app-test-scenarios.js`
16. `app-insights.js`
17. `app-init.js`

Not: `index.html` içinde ek yardımcı dosyalar varsa bu sıranın mantığını bozmadan eklenir.

## Görev Sonu Zorunlu Kontrol
- [ ] `kasam-lint.cjs` sıfır hata.
- [ ] Tüm local testler geçti: `node scripts/run-all-tests.cjs`.
- [ ] Görsel audit çalıştırıldı: `node scripts/visual-audit.cjs`.
- [ ] Playwright kuruluysa ek görsel test çalıştırıldı: `npm run test:playwright`.
- [ ] Ekran görüntüleri masaüstüne kopyalandı: `C:\Users\İRFAN AYYILDIZ\Desktop\kasam-test\visual-test-[tarih]\`.
- [ ] "BLOK X TAMAMLANDI" mesajında 3 bölüm var: `LOCAL SİMÜLASYON`, `GÖRSEL DOĞRULAMA`, `CLOUD TEST`.
- [ ] Yeni kural çıktıysa `KASAM-RULES.md` güncellendi.
- [ ] `KASAM-OWNER-PROFILE.md` güncellendi.
- [ ] `app-status-report.md` güncellendi.
- [ ] `CODEX-CONTEXT.md` gerekiyorsa güncellendi.
- [ ] Ortak kasa, bildirim veya oyun akışı değiştiyse çok kullanıcı simülasyon yolu hazır.

## Kritik Kurallar
- KURAL-001: Sarı zemin beyaz yazı yasak.
- KURAL-003: Hardcode renk yasak.
- KURAL-011: Türkçe ifadeler standart.
- KURAL-015: Tab bar her ekranda 5 sekme.
- KURAL-016: Sürpriz hareket oyun bitmeden gizli.
- KURAL-018: API key frontend’e yazılmaz.
- KURAL-025: Görsel doğrulama zorunlu; ekran görüntüsü olmadan UI görevi tamamlanmış sayılmaz.
- KURAL-026: Playwright test paketi yeni ekran ve bileşenlerle güncel tutulur.
- KURAL-027: Görsel test çıktıları masaüstündeki `kasam-test` klasörüne kaydedilir.
- KURAL-028: Test raporu `LOCAL SİMÜLASYON`, `GÖRSEL DOĞRULAMA`, `CLOUD TEST` olarak ayrılır.
- KURAL-044: Çok kullanıcılı işlevler simülasyonla kontrol edilir.
- KURAL-045: Türkçe kaynak kodlaması korunur.
- KURAL-046: Çok kullanıcılı başarı gerçek cloud/realtime ile kanıtlanır.
- KURAL-047: Tekil UI düzeltmesi bileşen ailesine uygulanır.
- KURAL-029: Premium görünüm görsel sağlamlık ve akış bütünlüğü demektir.
- KURAL-034: Ortak hareket cloud alanları eksiksiz taşınır.
- KURAL-035: Kayıt sonrası tekil ve kanıtlı senkron gerekir.

## Cloud Sync Kritik Alanları
`kasa_entries` okuma/yazma tarafında şu alanlar eksiksiz korunur:
- `paidById` / `paid_by_id`
- `splitWith` / `split_with`
- `splitRatio` / `split_ratio`
- `autoRevealAt` / `auto_reveal_at`
- `rateLockedAt` / `rate_locked_at`
- `updatedAt` / `updated_at`
- hareket medya alanları ve proje/profil fotoğrafları

Bu alanlar eksikse ortak kasa hareketi diğer kullanıcıda görünse bile kişisel kasa payı yanlış hesaplanabilir.

## Test Modu
- `?testScenario=1` gibi URL parametreleri auth bypass ile senaryo state’i yükler.
- `simUser=N` parametresi aynı senaryodaki N. kullanıcıyı aktif kullanıcı yapmalıdır.
- Test modu normal giriş akışını etkilemez; sadece URL’de `testScenario` varken aktif olur.

## Simülasyon Hedefi
`kasam-simulator.html` ortak kasa ve bildirim hatalarını görünür hale getirmek için kullanılır:
- 2-4 kullanıcıyı yan yana iframe olarak açar.
- `postMessage` ile kullanıcı aksiyonu gönderir.
- Hareket, bildirim, bakiye ve oyun akışını loglar.
- Senkron gecikmesi ve tutarsızlıkları raporlar.
- Otomatik ortak kasa testinde şu sonuçlar ayrı PASS/FAIL olmalıdır:
  - Ortak hareket tüm kullanıcılara düştü.
  - Bildirim alıcılara düştü.
  - Hareketi oluşturan kişide gereksiz bekleyen bildirim oluşmadı.
  - Kişisel kasa payları güncellendi.
- Otomatik sürpriz oyun testinde şu sonuçlar ayrı PASS/FAIL olmalıdır:
  - Sürpriz bildirimi alıcılara düştü.
  - Sürprizi oluşturan kişiye bekleyen oyun gösterilmedi.
  - Oyun bitmeden bakiye gizli kaldı.

## Bilinen Risk
Tarayıcı tabanlı Playwright testleri mevcut local runtime’da `npm`, `npx` veya `playwright-core` eksikse çalışmayabilir. Bu durumda `scripts/visual-audit.cjs` Chrome/CDP ile zorunlu görsel doğrulama kapısıdır; Playwright ek/opsiyonel kapı olarak raporlanır.

## Standart Kalite Komutları
- `node kasam-lint.cjs`
- `node scripts/run-all-tests.cjs`
- `node build-public.cjs`
- `node scripts/visual-audit.cjs`
- Canlı kontrol: `https://kasa-prototip.vercel.app/index.html` içinde `Güncellendi 14.06.2026 23:05` ve kritik dosya sürümleri aranır.

## Canonical Uygulama Adresi
- Tek production uygulamas? https://kasa-prototip.vercel.app.
- Supabase Auth Site URL ve Redirect URLs bu adrese gitmelidir.
- Eski Netlify prototipleri sadece y?nlendirme/arsiv ama?l?d?r; ?ifre s?f?rlama, davet linki ve payla??m linki eski host ?retmemelidir.
- Kod taraf?nda canonical adres cloud-config.js i?indeki appUrl alan?ndan okunur.

## Kullanici Gorevi Raporlama
- Her degisiklikten sonra final cevapta "Senin yapman gerekenler" ayri yazilir.
- Kullanici tarafinda is yoksa "Su an senin yapman gereken bir is yok" denir.
- Kullanici tarafinda panel, telefon, Supabase, Vercel veya mail testi gibi is varsa once ozetlenir ve "Hazir misin?" diye sorulur.
- Kullanici "evet" demeden adim adim anlatima gecilmez.

## Ek Kritik Kural
- KURAL-039: Ekran kalabaligi yasak. Yeni UI veya akista kullanicinin zaten girdigi bilgi tekrar sorulmaz; ikincil ayarlar kompakt, acilir veya adim adim gosterilir. Her degisiklikte 375px mobil genislikte tasma, sikisma ve gereksiz tekrar kontrol edilir.
