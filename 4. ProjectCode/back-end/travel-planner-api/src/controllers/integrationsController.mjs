import fetch from "node-fetch";
const UA = process.env.NOMINATIM_USER_AGENT || "travel-planner-demo/1.0";
export async function countryByCode(req, res) {
  const code = encodeURIComponent(req.params.code);
  const fields =
    req.query.fields ||
    "name,cca2,cca3,capital,region,subregion,population,flags";
  const url = `https://restcountries.com/v3.1/alpha/${code}?fields=${fields}`;
  const r = await fetch(url);
  res.status(r.status).json(await r.json());
}
export async function rates(req, res) {
  const base = encodeURIComponent(req.query.base || "USD");
  const symbols = req.query.symbols
    ? `&symbols=${encodeURIComponent(req.query.symbols)}`
    : "";
  const url = `https://api.exchangerate.host/latest?base=${base}${symbols}`;
  const r = await fetch(url);
  res.status(r.status).json(await r.json());
}
export async function geocode(req, res) {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "q required" });
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q
  )}&limit=5`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  res.status(r.status).json(await r.json());
}
export async function weather(req, res) {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat, lon required" });
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
    lat
  )}&longitude=${encodeURIComponent(
    lon
  )}&current_weather=true&forecast_days=3&hourly=temperature_2m&timezone=auto`;
  const r = await fetch(url);
  res.status(r.status).json(await r.json());
}
