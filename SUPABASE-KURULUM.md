# Kasa Supabase Kurulumu

Bu dosya gerçek e-posta/şifre hesabı ve farklı telefonlarda ortak kasa denemesi içindir.

## 1. Supabase projesi aç

Supabase panelinde yeni proje oluştur.

## 2. SQL dosyasını çalıştır

Supabase > SQL Editor bölümüne gir.

`supabase-schema.sql` dosyasının tamamını yapıştırıp çalıştır.

Bu işlem şunları oluşturur:

- Kullanıcı profilleri
- Kasa/proje tabloları
- Kasa üyelikleri
- Gelir/gider hareketleri
- Bildirimler
- Kasa koduyla katılma fonksiyonu
- E-posta ile kullanıcı ekleme fonksiyonu
- Row Level Security kuralları

## 3. API bilgilerini al

Supabase > Project Settings > API bölümünden:

- Project URL
- anon/public key

değerlerini al.

## 4. Uygulamaya yaz

`cloud-config.js` dosyasını aç.

```js
window.KASA_CLOUD_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-PUBLIC-ANON-KEY",
};
```

Buradaki iki değeri kendi Supabase bilgilerinle değiştir.

## 5. Yayına gönder

GitHub Desktop üzerinden Push origin yap.

Netlify yayını güncelledikten sonra uygulama e-posta/şifre ile hesap açma ve kasa koduyla katılma akışını kullanır.

## Game V2 Migration (supabase-game-v2.sql)

Bu adımı atlarsan 3 aşamalı oyun sistemi cloud'a yansımaz.

### Adımlar:
1. https://supabase.com adresine git
2. Projeyi seç (kasam projesi)
3. Sol menüden "SQL Editor" tıkla
4. Sayfanın sağ üstündeki "+ New query" butonuna tıkla
5. Proje klasöründeki supabase-game-v2.sql dosyasını aç
   (C:\Users\İRFAN AYYILDIZ\Documents\New project\
    ev-kasasi-prototype\kasa-prototip\supabase-game-v2.sql)
6. Dosyanın tüm içeriğini kopyala
7. Supabase SQL Editor'daki boş alana yapıştır
8. Sağ alt köşedeki yeşil "Run" butonuna tıkla
9. Alt panelde "Success" mesajı görünmeli
   Hata görünürse hata metnini kopyala ve bana ilet

### Kontrol:
Migration sonrası şunu kontrol et:
1. Sol menüden "Table Editor" tıkla
2. kasa_notifications tablosunu bul ve tıkla
3. Kolonlar arasında "game_phase" görünüyor mu?
   Görünüyorsa migration başarılı.
   Görünmüyorsa SQL Editor'da tekrar çalıştır.

## Tek Uygulama ve ?ifre S?f?rlama Redirect

?ifre s?f?rlama e-postas? eski prototipe gitmemeli. Supabase taraf?nda tek ana uygulama adresi Vercel olmal?.

### Supabase URL Configuration
1. Supabase Dashboard'a gir.
2. Sol men?den Authentication b?l?m?n? a?.
3. URL Configuration ekran?na gir.
4. Site URL alan?n? ?u yap: https://kasa-prototip.vercel.app
5. Redirect URLs alan?nda ?u adresler kals?n:
   - https://kasa-prototip.vercel.app/*
   - https://kasa-prototip.vercel.app/index.html
6. Eski Netlify veya eski prototip URL'leri varsa kald?r.
7. Save changes butonuna bas.

### Beklenen ?ifre Ak???
1. Kullan?c? giri? ekran?nda ?ifremi unuttum der.
2. Supabase mail g?nderir.
3. Maildeki link Vercel ?zerindeki Kasam reset ekran?n? a?ar.
4. Kullan?c? yeni ?ifreyi yazar.
5. Uygulama oturumu kapat?r ve giri? ekran?na d?ner.
6. Kullan?c? yeni ?ifreyle giri? yapar.
