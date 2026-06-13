exports.handler = async function handler(event) {
  const query = String(event.queryStringParameters?.q || "").trim().slice(0, 80);
  const key = process.env.GIPHY_API_KEY;
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=300",
  };

  if (!key) {
    return { statusCode: 200, headers, body: JSON.stringify({ data: [], warning: "GIPHY_API_KEY missing" }) };
  }

  if (!query) {
    return { statusCode: 200, headers, body: JSON.stringify({ data: [] }) };
  }

  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", key);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "12");
  url.searchParams.set("rating", "g");
  url.searchParams.set("lang", "tr");

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Giphy ${response.status}`);
    const payload = await response.json();
    const data = (payload.data || []).map((item) => ({
      id: item.id,
      title: item.title || "",
      url: item.images?.fixed_height_small?.url || item.images?.downsized_medium?.url || item.images?.original?.url || "",
    })).filter((item) => item.url);
    return { statusCode: 200, headers, body: JSON.stringify({ data }) };
  } catch (error) {
    return { statusCode: 502, headers, body: JSON.stringify({ data: [], error: "gif-search-failed" }) };
  }
};
