/**
 * TravelBrain Prototype UI Script
 * - Pure front-end (no backend required)
 * - Initializes Mapbox map, demo markers and route
 * - Provides small UI interactions (modes, add stop, select all, converter)
 */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Modes toggle: visual only
  for (const btn of $$('.mode')) {
    btn.addEventListener('click', () => {
      for (const b of $$('.mode')) { b.classList.remove('active'); b.setAttribute('aria-selected','false'); }
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
    });
  }

  // Add stop: injects an extra input (visual only)
  $('#addStop')?.addEventListener('click', () => {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';
    wrapper.innerHTML = `
      <span class="field-label">Stop</span>
      <input type="text" placeholder="Intermediate waypoint" />
    `;
    $('.fields').appendChild(wrapper);
  });

  // Recents: select/unselect all
  $('#selectAll')?.addEventListener('click', () => {
    const checks = $$('.recents input[type="checkbox"]');
    const allChecked = checks.every(c => c.checked);
    for (const c of checks) c.checked = !allChecked;
  });

  /** Mapbox GL setup (no backend)
   * Token precedence: localStorage('mb_token') > hardcoded fallback
   * Displays inline alerts for missing token / WebGL issues / API errors.
   */
  const mapEl = document.getElementById('map');
  if (mapEl && globalThis.mapboxgl) {
    const showMapAlert = (html) => {
      const host = mapEl.parentElement;
      if (!host) return;
      let note = host.querySelector('.map-alert');
      if (!note) { note = document.createElement('div'); note.className = 'map-alert'; host.appendChild(note); }
      note.innerHTML = html;
    };
    const clearMapAlert = () => {
      const host = mapEl.parentElement; if (!host) return;
      const note = host.querySelector('.map-alert'); if (note) note.remove();
    };
    // Read token from localStorage only (never hardcode or commit tokens)
    const token = (localStorage.getItem('mb_token')?.trim?.() || '').trim();
    if (token) {
      mapboxgl.accessToken = token;
      clearMapAlert();
      // Initial view (roughly between Sangolquí and Bogotá)
      const center = [-76, 0];
      // WebGL support check
      if (!mapboxgl.supported()) {
        showMapAlert('<b>WebGL not supported.</b> Try another browser or update drivers.');
        return;
      }

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: 4.3,
      attributionControl: true,
    });

    // Controls and initial resize
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl());
    setTimeout(() => map.resize(), 150);

    // Demo coordinates (approx): Sangolquí -> Bogotá
    const sangolqui = { name: 'Sangolquí', coord: [-78.443, -0.334] };
    const bogota    = { name: 'Bogotá',    coord: [-74.08175, 4.60971] };

    map.on('load', () => {
      // Markers
      new mapboxgl.Marker({ color: '#0b57d0' })
        .setLngLat(sangolqui.coord)
        .setPopup(new mapboxgl.Popup().setText(`${sangolqui.name}, EC`))
        .addTo(map);
      new mapboxgl.Marker({ color: '#d93025' })
        .setLngLat(bogota.coord)
        .setPopup(new mapboxgl.Popup().setText(`${bogota.name}, CO`))
        .addTo(map);

      // Route as a simplified GeoJSON LineString
      const route = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                sangolqui.coord,
                [-78, 0.5],
                [-77.5, 1.2],
                [-77, 1.8],
                [-76.5, 2.4],
                [-76, 3],
                [-75.5, 3.6],
                bogota.coord
              ]
            }
          }
        ]
      };

      map.addSource('route', { type: 'geojson', data: route });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#1a73e8',
          'line-width': 4,
          'line-dasharray': [2, 2]
        }
      });

      // Fit viewport to route extent
      const coords = route.features[0].geometry.coordinates;
      const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
      map.fitBounds(bounds, { padding: 80, duration: 800 });
    });

    // Preview button: toggle dashed line visual only
    const previewBtn = document.getElementById('btnPreview');
    previewBtn?.addEventListener('click', () => {
      const dashed = map.getPaintProperty('route-line', 'line-dasharray');
      map.setPaintProperty('route-line', 'line-dasharray', dashed ? null : [2, 2]);
    });

    // Surface errors (e.g., 401 invalid token or domain restriction)
    map.on('error', (e) => {
      // eslint-disable-next-line no-console
      console.error('Mapbox error:', e?.error || e);
      showMapAlert('<b>Map error.</b> Open DevTools > Console for details. If status 401/403 appears, verify your token and URL restrictions.');
    });
    } else {
      showMapAlert('<b>Map token missing.</b> Save it locally in this browser:<br><code>localStorage.setItem(\'mb_token\', \'pk...\')</code> and reload.');
    } // end token guard
  }

  // Directions button: focus first input (visual only)
  $('#btnGetDirections')?.addEventListener('click', () => {
    $('#fromInput')?.focus();
  });

  // Currency converter (static demo rates; front-end only)
  const RATES = {
    USD: { USD: 1, EUR: 0.92, COP: 4120, MXN: 18.2, CLP: 950 },
    EUR: { USD: 1.09, EUR: 1, COP: 4470, MXN: 19.7, CLP: 1020 },
    COP: { USD: 0.00024, EUR: 0.00022, COP: 1, MXN: 0.0044, CLP: 0.24 },
    MXN: { USD: 0.055, EUR: 0.051, COP: 225, MXN: 1, CLP: 52 },
    CLP: { USD: 0.00105, EUR: 0.00098, COP: 4.1, MXN: 0.019, CLP: 1 },
  };
  const format = (n, code) => {
    try {
      return new Intl.NumberFormat('es-EC', { style: 'currency', currency: code }).format(n);
    } catch { return `${n.toFixed(2)} ${code}`; }
  };
  const form = $('#fxForm');
  const amount = $('#amount');
  const from = $('#fromCurr');
  const to = $('#toCurr');
  const out = $('#result');

  const convert = () => {
  const a = Number.parseFloat(amount.value || '0');
    const src = from.value, dst = to.value;
    const rate = RATES[src]?.[dst] ?? 1;
    const val = a * rate;
    out.textContent = `${format(val, dst)}`;
  };

  form?.addEventListener('submit', (e) => { e.preventDefault(); convert(); });
  for (const el of [amount, from, to]) el?.addEventListener('input', convert);

  // Swap currencies
  $('#swap')?.addEventListener('click', () => {
    const a = from.value; from.value = to.value; to.value = a; convert();
  });

  // Initial render
  convert();

  // Logo fallback: if image is missing, replace with initials badge
  const logoImg = document.getElementById('logoImg');
  if (logoImg) {
    logoImg.addEventListener('error', () => {
      const span = document.createElement('span');
      span.className = 'logo';
      span.setAttribute('aria-hidden','true');
      span.textContent = 'TB';
      logoImg.replaceWith(span);
    }, { once: true });
  }
})();
