const TCMB_CODES = new Set(["USD", "EUR", "GBP", "CHF", "JPY", "SAR"]);

function tcmbPathFor(dateText) {
  const value = String(dateText || "").slice(0, 10);
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "today.xml";
  const [, year, month, day] = match;
  return `${year}${month}/${day}${month}${year}.xml`;
}

function parseRate(xml, currency) {
  const block = xml.match(new RegExp(`<Currency[^>]+CurrencyCode="${currency}"[^>]*>([\\s\\S]*?)<\\/Currency>`));
  if (!block) return null;
  const selling = block[1].match(/<ForexSelling>([^<]+)<\/ForexSelling>/)?.[1];
  const buying = block[1].match(/<ForexBuying>([^<]+)<\/ForexBuying>/)?.[1];
  const value = Number(String(selling || buying || "").replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

module.exports = async function handler(req, res) {
  const currency = String(req.query.currency || "USD").toUpperCase();
  const date = String(req.query.date || "");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (!TCMB_CODES.has(currency)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "unsupported-currency" }));
    return;
  }

  const paths = [tcmbPathFor(date), "today.xml"];
  for (const path of paths) {
    try {
      const response = await fetch(`https://www.tcmb.gov.tr/kurlar/${path}`);
      if (!response.ok) continue;
      const xml = await response.text();
      const rate = parseRate(xml, currency);
      if (rate) {
        res.statusCode = 200;
        res.end(JSON.stringify({ currency, rate, source: "TCMB", path, rateLockedAt: new Date().toISOString() }));
        return;
      }
    } catch (_error) {}
  }

  res.statusCode = 502;
  res.end(JSON.stringify({ error: "rate-unavailable", currency }));
};
