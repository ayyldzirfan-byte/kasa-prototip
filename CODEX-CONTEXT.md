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

## Teknoloji Stack
- Frontend: Vanilla JS PWA, CSS custom properties.
- Backend: Supabase Auth, Database, Realtime ve Storage yaklaşımı.
- Deploy: Vercel.
- Test: Node.js `.cjs` dosyaları.
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
- [ ] İlgili testler geçti.
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
- KURAL-025: Çok kullanıcılı işlevler simülasyonla kontrol edilir.
- KURAL-026: Türkçe kaynak kodlaması korunur.

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

## Bilinen Risk
Tarayıcı tabanlı Playwright testleri mevcut local runtime’da `playwright-core` eksikse çalışmayabilir. Bu durumda Node tabanlı testler yine çalıştırılır, tarayıcı testi “bağımlılık eksik” olarak raporlanır.
