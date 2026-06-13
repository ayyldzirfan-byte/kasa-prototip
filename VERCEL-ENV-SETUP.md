# Vercel Environment Variable Kurulumu

## Neden gerekli?
GIF arama, AI koç ve ekstre görsel analizi bu anahtarlar
olmadan çalışmaz. Anahtarlar kod içinde değil, güvenli
ortam değişkenlerinde tutulur.

## Adım 1 — Giphy API Key Al
1. https://developers.giphy.com adresine git
2. "Create an App" butonuna tıkla
3. Uygulama adı: "Kasam" yaz
4. API Key tipini seç (SDK değil, API Key)
5. Oluşturulan key'i kopyala (örn: abc123xyz...)

## Adım 2 — Anthropic API Key Al
1. https://console.anthropic.com adresine git
2. Sol menüden "API Keys" seç
3. "Create Key" butonuna tıkla
4. İsim: "kasam-production" yaz
5. Oluşturulan key'i kopyala (sk-ant-...)
6. ÖNEMLİ: Bu key bir daha gösterilmez, hemen kaydet

## Adım 3 — Vercel'e Key'leri Ekle
1. https://vercel.com adresine git, hesabına giriş yap
2. Sol panelden "kasa-prototip" projesini seç
3. Üst menüden "Settings" sekmesine tıkla
4. Sol menüden "Environment Variables" seç
5. Her key için şu adımları tekrarla:
   a. "Add New" butonuna tıkla
   b. Name alanına değişken adını yaz (aşağıdan kopyala)
   c. Value alanına key'i yapıştır
   d. Environment: Production + Preview + Development seç
   e. "Save" butonuna tıkla

Eklenecek değişkenler:
  Name: GIPHY_API_KEY
  Value: [Giphy'den aldığın key]

  Name: ANTHROPIC_API_KEY
  Value: [Anthropic'ten aldığın key]

## Adım 4 — Deploy'u Yenile
Key'leri ekledikten sonra Vercel yeni deploy gerektirir:
1. Vercel Dashboard > Deployments sekmesi
2. En üstteki deployment'a tıkla
3. Sağ üstteki "..." menüsünden "Redeploy" seç
4. "Redeploy" butonuna tıkla
5. 1-2 dakika bekle, deployment tamamlanınca test et

## Adım 5 — Test
Deployment bittikten sonra uygulamada:
  - Hareket eklerken tepki seçicide GIF sekmesine tıkla
  - Arama kutusuna "para" yaz
  - GIF'ler yükleniyorsa kurulum başarılı

## Sorun Giderme
Key ekledim ama GIF gelmiyor:
  → Vercel'de redeploy yaptın mı? Yapmadan değişmez.
  → Giphy key doğru kopyalandı mı? Başında/sonunda boşluk var mı?

"Unauthorized" hatası:
  → Anthropic key sk-ant- ile başlamalı
  → Key'in yetkisi var mı? console.anthropic.com'dan kontrol et
