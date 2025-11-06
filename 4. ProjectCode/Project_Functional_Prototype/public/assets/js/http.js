// public/assets/js/http.js
// Centralized fetch with credentials and robust JSON parsing.
(function(){
  function safeParseJson(text){
    if(text == null) return null;
    const cleaned = text.replace(/^\uFEFF/, '').trim();
    if(!cleaned) return null;
    try { return JSON.parse(cleaned); } catch(e){
      console.warn('JSON parse error:', e.message, cleaned.slice(0,200));
      return null;
    }
  }

  async function apiFetch(url, options={}){
    const opts = Object.assign({ credentials: 'include' }, options);
    // Default headers
    opts.headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
    const res = await fetch(url, opts);
    const raw = await res.text();
    const data = safeParseJson(raw);
    if(!res.ok){
      const err = new Error(`Request failed ${res.status}`);
      err.status = res.status;
      err.data = data;
      err.raw = raw;
      throw err;
    }
    return data;
  }

  async function apiJson(url, options={}){
    const data = await apiFetch(url, options);
    return data;
  }

  window.http = { apiFetch, apiJson };
})();
