const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const coachPrompt =
  "Aşağıdaki kullanıcının son 3 aylık harcama verisini analiz et. Türkçe yaz. Samimi, kısa ve güvenilir ol. Şunları üret: 1) genel finansal sağlık, 2) tutar bazlı 3 tasarruf fırsatı, 3) alışkanlık analizi, 4) hedef planı, 5) gelecek ay için 3 somut eylem. Sadece JSON döndür: {summary, opportunities, habits, goalPlan, actions}. Veri:\n";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: jsonHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }), { status: 500, headers: jsonHeaders });

  try {
    const body = await req.json();
    const summary = body.last3MonthsSummary || [];
    const anthropic = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") || "claude-3-5-sonnet-latest",
        max_tokens: 1800,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: coachPrompt + JSON.stringify(summary),
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "AI coach failed" }), { status: 500, headers: jsonHeaders });
  }
});
