const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: jsonHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }), { status: 500, headers: jsonHeaders });

  try {
    const body = await req.json();
    const imageBase64 = String(body.imageBase64 || "");
    const mimeType = String(body.mimeType || "image/png");
    if (!imageBase64) return new Response(JSON.stringify({ error: "imageBase64 required" }), { status: 400, headers: jsonHeaders });

    const anthropic = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") || "claude-3-5-sonnet-latest",
        max_tokens: 1600,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
              {
                type: "text",
                text:
                  "Bu banka ekstresi görüntüsündeki tüm işlemleri JSON formatında çıkar. Her işlem için: date, description, amount, currency. Sadece şu JSON'u döndür: {\"rows\":[{\"date\":\"YYYY-MM-DD\",\"description\":\"...\",\"amount\":123.45,\"currency\":\"TRY\"}]}",
              },
            ],
          },
        ],
      }),
    });
    const data = await anthropic.json();
    if (!anthropic.ok) return new Response(JSON.stringify({ error: data.error?.message || "Anthropic error" }), { status: anthropic.status, headers: jsonHeaders });
    const text = data.content?.map((item: { text?: string }) => item.text || "").join("\n").trim() || "{}";
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return new Response(JSON.stringify(parsed), { status: 200, headers: jsonHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Vision analysis failed" }), { status: 500, headers: jsonHeaders });
  }
});
