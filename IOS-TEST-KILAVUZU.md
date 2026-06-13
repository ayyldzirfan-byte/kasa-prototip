# iOS PWA Test Kılavuzu

## Neden iOS'ta test etmeli?
Android ve masaüstü tarayıcıda geçen testler iOS Safari'de
farklı davranabilir. PWA kurulumu, bildirimler ve ses sistemi
iOS'ta ayrıca test edilmeli.

## Adım 1 — PWA Kurulumu
1. iPhone'da Safari'yi aç (Chrome değil, Safari olmalı)
2. https://kasa-prototip.vercel.app adresine git
3. Alttaki paylaş ikonuna (kare + yukarı ok) tıkla
4. "Ana Ekrana Ekle" seçeneğini bul ve tıkla
5. İsim "Kasam" olarak gelecek, "Ekle" butonuna bas
6. Ana ekranda Kasam ikonu göründü mü? → Kurulum başarılı

## Adım 2 — 3 Kullanıcılı Senaryo
3 farklı hesap gerekiyor. Hazırsa bu adımları uygula:

Kullanıcı 1 (sen — iPhone):
  1. Kasam'ı aç, giriş yap
  2. Yeni bütçe oluştur: "Test Evi"
  3. Kod'u not et (örn: TEST-EV-1)

Kullanıcı 2 (başka telefon veya tarayıcı):
  1. https://kasa-prototip.vercel.app aç
  2. Kayıt ol (farklı email)
  3. "Kod ile katıl" → TEST-EV-1 kodunu gir

Kullanıcı 3 (üçüncü telefon veya gizli sekme):
  Aynı şekilde katıl

## Adım 3 — Sürpriz Oyun Testi
Kullanıcı 1 olarak:
  1. "Hareket ekle" butonuna bas
  2. Gider seç, tutar gir (örn: 500 TL)
  3. Başlık: "Market"
  4. "Bildirim oyunu" bölümünü aç
  5. "Sürpriz" modunu seç
  6. Aşama 1: Kim ekledi? → tepki ekle (emoji veya fotoğraf)
  7. Aşama 2: Gelir/gider tepkileri ekle
  8. Aşama 3: 4 seçenek yaz (A/B/C/D), doğru cevabı seç
  9. "Kaydet" butonuna bas

Kullanıcı 2 olarak:
  1. Bildirimler'e git
  2. "Kim ekledi?" sorusu geliyor mu? → Evet ise PASS
  3. Tahmin yap → animasyon çıkıyor mu?
  4. Ses duyuluyor mu? (sessiz modda olmadığından emin ol)
  5. Aşama 2 otomatik açılıyor mu?
  6. Aşama 3 çoktan seçmeli geliyor mu?

## Adım 4 — Kontrol Listesi
Her maddeyi test et, sonucu yaz (✓ veya ✗):

  [ ] PWA ana ekrana kuruldu
  [ ] Uygulama tam ekran açılıyor (Safari çubuğu yok)
  [ ] Sürpriz hareket eklendi
  [ ] Bildirim karşı kullanıcıya ulaştı
  [ ] Aşama 1 "Kim ekledi?" ekranı açıldı
  [ ] Doğru tahmin animasyonu çalıştı
  [ ] Ses duyuldu
  [ ] Aşama 2 otomatik geçti
  [ ] Aşama 3 çoktan seçmeli açıldı
  [ ] Oyun bitince hareket kasaya yansıdı
  [ ] Tema koyu modda doğru görünüyor
  [ ] Tab bar 5 sekme tam görünüyor

## Sorun Bildirme
Test sırasında sorun çıkarsa:
  1. Hangi adımda takıldığını not et
  2. Ekran görüntüsü al
  3. Ekran görüntüsünü ve adım numarasını paylaş
