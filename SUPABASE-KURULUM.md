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

