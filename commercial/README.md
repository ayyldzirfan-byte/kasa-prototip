# Kasam Commercial

Next.js 15, TypeScript, Tailwind v4 ve Supabase tabanli ticari rebuild alani.

Bu klasor mevcut production PWA'dan izoledir. Kok Vercel deploy'u su an hala eski PWA'yi `public/` uzerinden yayinlar.

## Local

```bash
npm install
npm run dev
```

## Test

```bash
npm test
npm run typecheck
npm run build
npm run test:visual
```

Playwright ekran goruntuleri varsayilan olarak:

```text
C:\Users\İRFAN AYYILDIZ\Desktop\kasam-test\commercial-visual
```

## Env

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Secret key veya service role key frontend'e yazilmaz.

## Deploy Notu

Commercial app production'a alinmadan once:

1. `npm --prefix commercial test`
2. `npm --prefix commercial run typecheck`
3. `npm --prefix commercial run build`
4. `npm --prefix commercial run test:visual`
5. Supabase cloud smoke test

gecmeli. Bu kanitlar tamamlanmadan kok `vercel.json` commercial app'e cevrilmez.
