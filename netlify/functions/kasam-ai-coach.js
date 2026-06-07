const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async function kasamAiCoach(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const summary = body.last3MonthsSummary || [];
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
        max_tokens: 1800,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content:
              "Aşağıdaki kullanıcının 3 aylık harcama verisini analiz et. Türkçe yaz. Samimi ve güvenilir ol. JSON döndür: {summary, opportunities, habits, goalPlan, actions}. Veri:\n" +
              JSON.stringify(summary),
          },
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, headers: JSON_HEADERS, body: JSON.stringify({ error: data.error?.message || "Anthropic error" }) };
    }
    const text = data.content?.map((item) => item.text || "").join("\n").trim() || "{}";
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(parsed) };
  } catch (error) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: error.message || "AI coach failed" }) };
  }
};
