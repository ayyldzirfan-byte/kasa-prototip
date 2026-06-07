# Kasam Claude API kurulumu

Claude API anahtarı frontend dosyalarına yazılmaz.

Netlify Function kullanımı:

1. Netlify Dashboard > Project configuration > Environment variables.
2. `ANTHROPIC_API_KEY` ekle.
3. Opsiyonel: `ANTHROPIC_MODEL=claude-3-5-sonnet-latest`.

Supabase Edge Function alternatifi:

```bash
supabase secrets set ANTHROPIC_API_KEY=...
supabase functions deploy kasam-vision
supabase functions deploy kasa-ai-coach
```

Frontend şu an Netlify endpointlerini çağırır:

- `/.netlify/functions/kasam-vision`
- `/.netlify/functions/kasam-ai-coach`
