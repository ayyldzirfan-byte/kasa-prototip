# Kasam — Uygulama Durum Raporu
Tarih: 2026-06-14

## Dosya Yapısı
| Dosya | Amaç | Durum |
|---|---|---|
| `index.html` | PWA kabuğu ve script yükleme sırası | Çalışıyor |
| `styles.css`, `kasam-ui-fixes.css` | Ana görsel sistem ve düzeltmeler | Çalışıyor, lint kontrolünde |
| `app-state.js` | Local state ve varsayılan veri | Çalışıyor |
| `app-core.js` | Yardımcı fonksiyonlar, formatlama, navigasyon | Çalışıyor |
| `app-views.js` | Ana ekran render akışları | Aktif geliştirme |
| `app-model.js` | Finansal hesaplar ve state normalizasyonu | Aktif geliştirme |
| `app-cloud.js` | Supabase sync ve cloud işlemleri | Kritik risk alanı |
| `app-game-v2.js` | 3 aşamalı tahmin oyunu | Testleri geçiyor |
| `app-test-scenarios.js` | Test senaryosu ve auth bypass | Aktif geliştirme |
| `kasam-simulator.html` | Çok kullanıcı iframe simülasyonu | Çalışıyor |
| `kasam-lint.cjs` | Proje kuralları lint denetimi | Çalışıyor |
| `KASAM-RULES.md` | Ürün ve kod kuralları | Güncel |
| `KASAM-OWNER-PROFILE.md` | Proje sahibi tercihleri | Güncel |
| `CODEX-CONTEXT.md` | Codex görev protokolü | Güncel |

## Özellik Listesi
| Özellik | Durum | Açıklama |
|---|---|---|
| Temel kasa gelir/gider/bakiye | Çalışıyor | Node testlerinde geçiyor |
| Ortak bütçe ve pay hesabı | Kısmi | Model testleri geçiyor, gerçek çok kullanıcı senkronu simulator ile ayrıca doğrulanmalı |
| memberSince tarihi | Çalışıyor | Test kapsıyor |
| Sürpriz bildirim oyunu — 3 aşamalı | Çalışıyor | Akış testleri geçiyor |
| Tahmin skoru ve tanışma skoru | Çalışıyor | `test-game-v2.cjs` kapsıyor |
| Tepki sistemi | Kısmi | Medya seçici sadeleştirildi, gerçek cihaz testi gerekli |
| Ses sistemi | Çalışıyor | Mock test geçiyor |
| Test senaryosu auth bypass | Çalışıyor | `testScenario` ve `simUser` local simulator akışında doğrulandı |
| Çok kullanıcı simulator | Çalışıyor | Local browser smoke testte 4 iframe, state hydrate ve kişisel pay görüldü |
| Tab bar 5 sekme | Çalışıyor | UI testleri geçiyor |
| Renk/kontrast kuralları | Çalışıyor | `kasam-lint.cjs` kontrol ediyor |
| PWA kurulumu | Kısmi | Kullanıcı iOS kurulumunu manuel test etti |
| Supabase RLS | Kısmi | SQL dosyaları var, dashboard tarafında uygulanma durumu kullanıcı ortamına bağlı |

## Veri Şeması
| Tablo | Amaç | RLS Durumu |
|---|---|---|
| `kasa_profiles` | Kullanıcı profilleri | SQL policy dosyalarında tanımlı |
| `kasa_projects` | Kişisel ve ortak kasalar | SQL policy dosyalarında tanımlı |
| `kasa_entries` | Gelir/gider hareketleri | SQL policy dosyalarında tanımlı |
| `kasa_notifications` | Bildirim ve oyun verisi | Game V2 migration ile genişletildi |
| `kasa_reactions` | Hareket tepkileri | SQL policy dosyalarında tanımlı |
| `kasa_goals` | Hedef/kumbara | SQL policy dosyalarında tanımlı |
| `kasa_settlements` | Hesaplaşma kayıtları | SQL policy dosyalarında tanımlı |
| `kasa_reconciliations` | Ekstre uzlaşması | SQL policy dosyalarında tanımlı |

## Bilinen Sorunlar
- Gerçek Supabase realtime üzerinden “ortak kasaya eklenen hareket diğer kullanıcı ekranına düştü” kanıtı henüz yeterince güçlü değil.
- Bildirimlerin çok kullanıcıda çiftlenmesi veya hiç düşmemesi riski simulator ile izlenmeli.
- Playwright tabanlı tarayıcı testi mevcut local runtime’da `playwright-core` eksik olduğu için çalışmıyor.
- Bazı eski kaynaklarda geçmiş encoding hasarı olabilir; yeni değişikliklerde UTF-8 korunmalı.

## Test Durumu
| Test | Sonuç |
|---|---|
| `kasam-lint.cjs` | 11 kural, 11 geçti, 0 başarısız |
| `test-kasa-e2e.cjs` | 18 test, 18 geçti, 0 başarısız |
| `test-game-v2.cjs` | 22 test, 22 geçti, 0 başarısız |
| `test-ui-fixes.cjs` | 11 test, 11 geçti, 0 başarısız |
| `test-simulator.cjs` | 7 test, 7 geçti, 0 başarısız |
| `test-shared-budget-sync.cjs` | PASS |
| `test-yilmaz-scenario-rhythm.cjs` | PASS |
| Browser smoke: `kasam-simulator.html` | PASS: 4 iframe açıldı, `add-entry` ve `hydrate-state` PASS, kişisel paylar göründü |
| `test-shared-ledger.cjs` | Çalışmadı: local runtime’da `playwright` eksik |
| `test-entry-open-flow.cjs` | Çalışmadı: local runtime’da `playwright` eksik |
| `test-testscenario-auth-bypass.cjs` | Çalışmadı: local runtime’da `playwright-core` eksik |

## Sonraki Adımlar
1. Gerçek Supabase deployment üzerinde realtime loglarıyla gecikme ve duplicate kontrolü yap.
2. Açık hareketin tek kez kaydedildiğini production ortamında doğrula.
3. Bildirim oyunu için gerçek kullanıcılar arasında uçtan uca test yap.
4. Playwright bağımlılığını düzelt veya tarayıcı testini opsiyonel script olarak bırak.
