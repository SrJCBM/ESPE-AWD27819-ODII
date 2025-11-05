// public/assets/js/weather.js
(
  function () {
    document.addEventListener('DOMContentLoaded', () => {
      const input = document.getElementById('weatherPlaceInput');
      const latEl = document.getElementById('weatherLat');
      const lonEl = document.getElementById('weatherLon');
      const getBtn = document.getElementById('getWeatherBtn');
      const result = document.getElementById('weatherResult');
      const mapEl = document.getElementById('weatherMap');

      async function fetchAndRenderWeather() {
        let lat = latEl.value || input?.dataset?.lat;
        let lon = lonEl.value || input?.dataset?.lon;
        const label = (input.value || '').trim();
        // Si no tenemos coords, intentar resolverlas con el servicio de sugerencias (Mapbox)
        if ((!lat || !lon) && label) {
          try {
            if (globalThis.PlacesAutocomplete && typeof globalThis.PlacesAutocomplete.suggestPlaces === 'function'){
              const feats = await globalThis.PlacesAutocomplete.suggestPlaces(label);
              const f = Array.isArray(feats) && feats.length ? feats[0] : null;
              const center = f && Array.isArray(f.center) ? f.center : null; // [lon, lat]
              if (center) {
                lon = String(center[0]);
                lat = String(center[1]);
                latEl.value = lat; lonEl.value = lon;
              }
            }
          } catch(_) {}
        }
        if (!lat || !lon || !label) {
          alert('Selecciona un lugar válido del autocompletado');
          return;
        }

        let json;
        let usedApi = false;
        try {
          const url = `/api/weather/current?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&q=${encodeURIComponent(label)}&log=1`;
          const res = await fetch(url, { credentials: 'include' });
          const text = await res.text();
          try {
            const clean = text ? String(text).replace(/^\uFEFF/, '').trim() : '';
            json = clean ? JSON.parse(clean) : null;
          } catch (parseErr) {
            console.warn('Weather API body (not JSON):', text);
            json = null;
          }
          usedApi = res.ok && !!json && typeof json === 'object';
          if (!usedApi) {
            console.warn('Weather API HTTP', res.status, json);
            json = null; // forzar simulador
          }
        } catch (e) {
          console.warn('Fallo consultando clima:', e?.message || e);
        }

        // Fallback simulado si no hay datos reales
        if (!usedApi) {
          const sim = await (window.app?.getSimulatedWeather ? window.app.getSimulatedWeather(`guest:${label}`) : Promise.resolve(null));
          if (sim) {
            json = {
              ok: true,
              location: sim.destName,
              temp: sim.temp,
              condition: sim.condition,
              humidity: sim.humidity ?? null,
              windSpeed: sim.windSpeed ?? null,
              precipitation: sim.precipitation ?? 0,
              pressure: sim.pressure ?? null,
              createdAt: new Date().toISOString(),
              lat: parseFloat(lat),
              lon: parseFloat(lon),
            };
          }
        }

        if (!json) return;

        const weatherLocation = document.getElementById('weatherLocation');
        const weatherDate = document.getElementById('weatherDate');
        const weatherMain = document.getElementById('weatherMain');
        const weatherDetails = document.getElementById('weatherDetails');

        weatherLocation.textContent = json.location || label;
        try {
          const d = json.createdAt ? new Date(json.createdAt) : new Date();
          const time = d.toLocaleString('es-EC', { hour: '2-digit', minute: '2-digit' });
          const date = d.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
          weatherDate.textContent = `${date} · ${time}`;
        } catch (_) {
          weatherDate.textContent = new Date().toLocaleString('es-EC');
        }

        weatherMain.innerHTML = `
          <div class="temp-main">
            <span class="temp">${json.temp ?? '—'}°C</span>
            <span class="condition">${json.condition || ''}</span>
          </div>
        `;

        weatherDetails.innerHTML = `
          <ul class="weather-list">
            <li>Humedad: ${json.humidity ?? '—'}%</li>
            <li>Viento: ${json.windSpeed ?? '—'} km/h</li>
            <li>Precipitación: ${json.precipitation ?? 0}%</li>
            <li>Presión: ${json.pressure ?? '—'} hPa</li>
          </ul>
        `;

        result.style.display = 'block';

        // Mostrar mapa si Mapbox está disponible
        try {
          if (globalThis.mapboxgl && mapEl) {
            mapboxgl.accessToken = (globalThis.__CONFIG__?.MAPBOX_TOKEN) || localStorage.getItem('mb_token') || mapboxgl.accessToken;
            const map = new mapboxgl.Map({
              container: mapEl,
              style: 'mapbox://styles/mapbox/streets-v12',
              center: [Number(json.lon || lon), Number(json.lat || lat)],
              zoom: 10,
            });
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
            new mapboxgl.Marker().setLngLat([Number(json.lon || lon), Number(json.lat || lat)]).addTo(map);
          }
        } catch (e) {
          console.warn('No se pudo inicializar el mapa:', e.message);
        }

        // Si el usuario está logueado, listar historial desde la API con formato bonito
        try {
          const me = await (globalThis.Auth ? globalThis.Auth.me() : Promise.reject());
          if (me && me.ok) {
            await renderHistoryFromApi();
          } else {
            clearHistoryList();
          }
        } catch (_) {
          clearHistoryList();
        }
      }

      function clearHistoryList(){
        const list = document.getElementById('weatherList');
        if (list) list.innerHTML = '';
      }

      async function renderHistoryFromApi(){
        const list = document.getElementById('weatherList');
        if (!list) return;
        list.innerHTML = '<li class="muted">Cargando historial...</li>';
        try {
          const res = await fetch('/api/weather/history?page=1&size=20', { credentials: 'include' });
          if (!res.ok) { list.innerHTML = ''; return; }
          const json = await res.json();
          const items = json.items || [];
          list.innerHTML = '';
          for (const it of items) {
            const when = it.createdAt ? new Date(it.createdAt) : null;
            const time = when ? when.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : '';
            const date = when ? when.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
            const li = document.createElement('li');
            li.innerHTML = `<div><strong>${escapeHtml(it.label || '')}</strong> · ${it.temp ?? '—'}°C · ${escapeHtml(it.condition || '')}<br><small>${date} ${time}</small></div>`;
            list.appendChild(li);
          }
        } catch (e) {
          list.innerHTML = '';
        }
      }

      function escapeHtml(text){
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
      }

      getBtn.addEventListener('click', fetchAndRenderWeather);
    });
  }
)();
