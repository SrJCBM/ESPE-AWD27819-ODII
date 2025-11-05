(function(){
  const MB_TOKEN = (globalThis.__CONFIG__ && globalThis.__CONFIG__.MAPBOX_TOKEN)
    ? globalThis.__CONFIG__.MAPBOX_TOKEN
    : (typeof localStorage !== 'undefined' ? localStorage.getItem('mb_token') : null);

  async function fetchJSON(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  function countryFromFeature(f){
    const ctx = f && Array.isArray(f.context) ? f.context : [];
    const c = ctx.find(x => typeof x.id === 'string' && x.id.startsWith('country'));
    if (c && (c.text || c.text_es)) return c.text_es || c.text;
    // fallback parse
    if (typeof f.place_name === 'string'){
      const parts = f.place_name.split(',').map(s=>s.trim());
      if (parts.length) return parts[parts.length-1];
    }
    return '';
  }

  const cache = new Map();
  async function suggestPlaces(query){
    if (!MB_TOKEN || !query || query.length < 3) return [];
    const key = `p:${query.toLowerCase()}`;
    if (cache.has(key)) return cache.get(key);
    const params = new URLSearchParams({
      access_token: MB_TOKEN,
      autocomplete: 'true',
      language: 'es',
      limit: '6',
      types: 'place,locality,region'
    });
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
    const json = await fetchJSON(url).catch(()=>({features:[]}));
    const feats = Array.isArray(json.features) ? json.features : [];
    cache.set(key, feats);
    return feats;
  }

  function wire(inputId, datalistId, onSelect){
    const input = document.getElementById(inputId);
    const list = document.getElementById(datalistId);
    if (!input || !list) return;
    let lastQ = ''; let last = [];

    async function refresh(){
      const q = input.value.trim();
      if (q.length < 3 || q === lastQ) return;
      lastQ = q;
      last = await suggestPlaces(q);
      while(list.firstChild) list.firstChild.remove();
      for(const f of last){
        const opt = document.createElement('option');
        opt.value = f.place_name;
        list.appendChild(opt);
      }
    }

    input.addEventListener('input', refresh);
    input.addEventListener('change', ()=>{
      const val = input.value.trim();
      if(!val) return;
      const f = last.find(x=>x.place_name === val) || last[0];
      if(!f) return;
      try{ onSelect && onSelect(f, { country: countryFromFeature(f) }); }catch(_){ }
    });
  }

  globalThis.PlacesAutocomplete = { wire, suggestPlaces, countryFromFeature };
})();
