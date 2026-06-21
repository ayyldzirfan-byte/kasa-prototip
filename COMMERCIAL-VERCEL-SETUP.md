# Kasam Commercial Vercel Kurulumu

Bu kurulum mevcut `kasa-prototip.vercel.app` PWA yayınına dokunmaz. Commercial rebuild ayrı Vercel project olarak açılır.

## Hedef

- Mevcut production PWA: `kasa-prototip.vercel.app`
- Yeni commercial test app: ayrı Vercel project
- Repo aynı kalır.
- Yeni project root directory: `commercial`

## Vercel Project Oluşturma

1. Vercel Dashboard'a git.
2. `Add New` > `Project` seç.
3. GitHub repository olarak `kasa-prototip` seç.
4. Project adı önerisi:
   `kasam-commercial`
5. `Root Directory` alanını aç.
6. Root Directory değerini şuna ayarla:
   `commercial`
7. Framework Preset:
   `Next.js`
8. Build Command:
   `npm run build`
9. Install Command:
   `npm install`
10. Output Directory:
   `.next`
   Vercel `public` output'a takılırsa deploy boş klasör hatası verir.

## Environment Variables

Commercial project içinde `Settings > Environment Variables` bölümüne şunları ekle:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Değerler mevcut `cloud-config.js` içindeki Supabase URL ve publishable/anon key ile aynı olabilir.

Eklenmeyecek değişkenler:

```text
KASAM_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Service role key Vercel frontend project ortamına girilmez.

## Deploy Kontrolü

İlk deploy `Ready` olunca commercial URL'yi aç.

Beklenen:

- Ana ekran açılır.
- Alt tab 5 sekme görünür.
- Hareket ekleme akışı açılır.
- Bildirim ekranında sürpriz detay gizliliği korunur.
- Rapor ekranı açılır.

## Supabase Auth Redirect

Commercial URL kalıcı kullanılacaksa Supabase Dashboard'da ekle:

```text
https://[commercial-vercel-domain]/*
https://[commercial-vercel-domain]/auth/callback
```

Mevcut `kasa-prototip.vercel.app` redirect kayıtlarını silme.

## Lokal Kontrol Komutları

Proje kökünden:

```powershell
npm.cmd run commercial:deploy-ready
npm.cmd run commercial:cloud-smoke:prompt
```

Commercial klasöründen:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:visual
```

## Kural

Commercial project gerçek kullanıcı testine açılmadan önce:

- Local test geçmeli.
- Visual test geçmeli.
- Cloud smoke geçmeli.
- Mevcut PWA production deploy'u bozulmamalı.
