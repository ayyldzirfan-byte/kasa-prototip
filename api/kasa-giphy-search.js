module.exports = async function handler(request, response) {
  const query = String(request.query?.q || "").trim().slice(0, 80);
  const key = process.env.GIPHY_API_KEY;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "public, max-age=300");

  if (!key) {
    response.status(200).json({ data: [], warning: "GIPHY_API_KEY missing" });
    return;
  }

  if (!query) {
    response.status(200).json({ data: [] });
    return;
  }

  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", key);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "12");
  url.searchParams.set("rating", "g");
  url.searchParams.set("lang", "tr");

  try {
    const giphyResponse = await fetch(url);
    if (!giphyResponse.ok) throw new Error(`Giphy ${giphyResponse.status}`);
    const payload = await giphyResponse.json();
    const data = (payload.data || [])
      .map((item) => ({
        id: item.id,
        title: item.title || "",
        url: item.images?.fixed_height_small?.url || item.images?.downsized_medium?.url || item.images?.original?.url || "",
      }))
      .filter((item) => item.url);
    response.status(200).json({ data });
  } catch (error) {
    response.status(502).json({ data: [], error: "gif-search-failed" });
  }
};
