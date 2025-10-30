        // Token de Mapbox: primero intenta desde config pública, si no, desde localStorage
        mapboxgl.accessToken = (globalThis.__CONFIG__?.MAPBOX_TOKEN)
            ? globalThis.__CONFIG__.MAPBOX_TOKEN
            : localStorage.getItem('mb_token');
        if (!mapboxgl.accessToken) {
            console.warn('MAPBOX_TOKEN no configurado. Define MAPBOX_TOKEN en el servidor o guarda "mb_token" en localStorage.');
        }

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-76, 0],
            zoom: 4.3
        });
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        const MB_TOKEN = mapboxgl.accessToken;

        async function ensureStyleReady(m) {
            if (m.isStyleLoaded()) return;
            await new Promise(res => m.once('style.load', res));
        }

        async function geocodePlace(query) {
            const params = new URLSearchParams({
                access_token: MB_TOKEN,
                limit: '1',
                language: 'es',
                routing: 'true',
                // sin restricción de país para búsquedas globales
            });
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` + params;
            const res = await fetch(url);
            const data = await res.json();
            const feat = data.features?.[0];
            if (!feat) throw new Error('No se encontró: ' + query);
            return feat.routable_points?.points?.[0]?.coordinates || feat.center;
        }

        async function suggestPlaces(query) {
            if (!query || query.length < 3) { return []; }
            const params = new URLSearchParams({
                access_token: MB_TOKEN,
                limit: '5',
                language: 'es',
                autocomplete: 'true',
                types: 'place,locality,region'
            });
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` + params;
            const res = await fetch(url);
            const data = await res.json();
            const out = [];
            for (const f of (data.features || [])) {
                if (f?.place_name) { out.push(f.place_name); }
            }
            return out;
        }

        function wireAutocomplete(inputId, listId) {
            const input = document.getElementById(inputId);
            const list = document.getElementById(listId);
            if (!input || !list) { return; }
            let lastQ = '';
            input.addEventListener('input', async () => {
                const q = input.value.trim();
                if (q === lastQ) { return; }
                lastQ = q;
                const suggestions = await suggestPlaces(q);
                // limpiar datalist
                while (list.firstChild) { list.firstChild.remove(); }
                for (const s of suggestions) {
                    const opt = document.createElement('option');
                    opt.value = s;
                    list.appendChild(opt);
                }
            });
        }

        async function getRoute(origin, dest, profile = 'mapbox/driving') {
            const params = new URLSearchParams({
                geometries: 'geojson',
                overview: 'simplified',
                access_token: MB_TOKEN
            });
            const coordStr = `${origin[0]},${origin[1]};${dest[0]},${dest[1]}`;
            const url = `https://api.mapbox.com/directions/v5/${profile}/${coordStr}?` + params;
            const res = await fetch(url);
            const json = await res.json();
            const route = json.routes?.[0];
            if (!route) throw new Error('No se obtuvo ruta');
            return { distance: route.distance, duration: route.duration, geometry: route.geometry };
        }

        function drawRoute(m, lineString) {
            const fc = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: lineString }] };
            if (m.getSource('route')) {
                m.getSource('route').setData(fc);
            } else {
                m.addSource('route', { type: 'geojson', data: fc });
                m.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    paint: { 'line-color': '#1a73e8', 'line-width': 4 }
                });
            }
        }

        // habilitar autocompletado global
        wireAutocomplete('originInput','originList');
        wireAutocomplete('destInput','destList');

        document.getElementById('calcRouteBtn').addEventListener('click', async () => {
            const oText = document.getElementById('originInput').value?.trim();
            const dText = document.getElementById('destInput').value?.trim();
            const out = document.getElementById('routeResult');

            if (!oText || !dText) {
                out.textContent = 'Selecciona origen y destino.';
                return;
            }

            out.textContent = 'Calculando...';
            try {
                await ensureStyleReady(map);
                const [oCoord, dCoord] = await Promise.all([geocodePlace(oText), geocodePlace(dText)]);
                const route = await getRoute(oCoord, dCoord, 'mapbox/driving');
                const km = (route.distance / 1000).toFixed(1);
                const min = Math.round(route.duration / 60);
                out.textContent = `${km} km • ${min} min`;
                drawRoute(map, route.geometry);
                const coords = route.geometry.coordinates;
                const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
                map.fitBounds(bounds, { padding: 40 });
            } catch (e) {
                out.textContent = 'No fue posible calcular la ruta.';
                console.error(e);
            }
        });