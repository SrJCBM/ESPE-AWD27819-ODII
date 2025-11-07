(function(){
  function sanitizeToken(value){
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    return trimmed;
  }

  function resolveMapboxToken(){
    const fromConfig = sanitizeToken(globalThis.__CONFIG__ && globalThis.__CONFIG__.MAPBOX_TOKEN);
    if (fromConfig) {
      try {
        if (typeof localStorage !== 'undefined') {
          const stored = sanitizeToken(localStorage.getItem('mb_token'));
          if (stored !== fromConfig) {
            localStorage.setItem('mb_token', fromConfig);
          }
        }
      } catch (err) {
        console.warn('No se pudo sincronizar el token de Mapbox para autocompletado:', err);
      }
      return fromConfig;
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const stored = sanitizeToken(localStorage.getItem('mb_token'));
        if (stored) return stored;
      }
    } catch (err) {
      console.warn('No se pudo leer el token de Mapbox desde localStorage para autocompletado:', err);
    }

    return null;
  }

  // Mapbox token strategy similar a map.js
  const MB_TOKEN = resolveMapboxToken();

  async function fetchJSON(url){
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  function getCountryFromFeature(f){
    // Try context first
    const ctx = f && Array.isArray(f.context) ? f.context : [];
    const c = ctx.find(x => typeof x.id === 'string' && x.id.startsWith('country'));
    if (c && (c.text || c.text_es)) return c.text_es || c.text;
    // Fallback: parse from place_name (last comma-separated part)
    if (typeof f.place_name === 'string'){ 
      const parts = f.place_name.split(',').map(s=>s.trim());
      if (parts.length) return parts[parts.length - 1];
    }
    return '';
  }

  // Simple in-memory cache to avoid hitting API too often
  const cache = new Map();

  async function mapboxSuggest(query){
    if (!MB_TOKEN || !query || query.length < 3) return [];
    const key = `s:${query.toLowerCase()}`;
    if (cache.has(key)) return cache.get(key);
    const params = new URLSearchParams({
      access_token: MB_TOKEN,
      autocomplete: 'true',
      language: 'es',
      limit: '5',
      types: 'place,locality,region'
    });
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
    const data = await fetchJSON(url).catch(()=>({features:[]}));
    const feats = Array.isArray(data.features) ? data.features : [];
    cache.set(key, feats);
    return feats;
  }

  function wireDestinationAutocomplete(){
    const nameInput = document.getElementById('destName');
    const countryInput = document.getElementById('destCountry');
    const latInput = document.getElementById('destLat');
    const lngInput = document.getElementById('destLng');
    const list = document.getElementById('destPlaceList');
    if (!nameInput || !list) return;

    let lastQ = '';
    let lastResults = [];

    async function refreshList(){
      const q = nameInput.value.trim();
      if (q.length < 3 || q === lastQ) return;
      lastQ = q;
      lastResults = await mapboxSuggest(q);

      // Rebuild datalist
      while (list.firstChild) list.firstChild.remove();
      for (const f of lastResults){
        const opt = document.createElement('option');
        opt.value = f.place_name; // Show full name
        list.appendChild(opt);
      }
    }

    // Update suggestions as user types (debounced via lastQ guard)
    nameInput.addEventListener('input', refreshList);

    // When user commits a value that matches a suggestion, fill country/lat/lng
    nameInput.addEventListener('change', () => {
      const val = nameInput.value.trim();
      if (!val) return;
      const found = lastResults.find(f => f.place_name === val) || lastResults[0];
      if (!found) return;
      try {
        const center = Array.isArray(found.center) ? found.center : null; // [lon, lat]
        const country = getCountryFromFeature(found);
        if (country && countryInput) countryInput.value = country;
        if (center && center.length === 2){
          if (lngInput) lngInput.value = String(center[0]);
          if (latInput) latInput.value = String(center[1]);
        }
      } catch(_){}
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wireDestinationAutocomplete);
  } else {
    wireDestinationAutocomplete();
  }
})();
