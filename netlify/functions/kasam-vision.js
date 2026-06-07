const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async function kasamVision(event) {
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
    const imageBase64 = String(body.imageBase64 || "");
    const mimeType = String(body.mimeType || "image/png");
    if (!imageBase64) {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: "imageBase64 required" }) };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
        max_tokens: 1600,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mimeType, data: imageBase64 },
              },
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

    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, headers: JSON_HEADERS, body: JSON.stringify({ error: data.error?.message || "Anthropic error" }) };
    }

    const text = data.content?.map((item) => item.text || "").join("\n").trim() || "{}";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const parsed = JSON.parse(jsonStart >= 0 && jsonEnd >= 0 ? text.slice(jsonStart, jsonEnd + 1) : text);
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(parsed) };
  } catch (error) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: error.message || "Vision analysis failed" }) };
  }
};
