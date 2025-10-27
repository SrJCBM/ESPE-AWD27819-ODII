localStorage.setItem('mb_token', 'pk.eyJ1Ijoic3JqY2JtIiwiYSI6ImNtZ3g0eGV5NDAwZzYya3BvdmFveWU2dnEifQ.yYCrLmlo9lW-AJf56akVCw');
        mapboxgl.accessToken = localStorage.getItem('mb_token');

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
                country: 'ec,co'
            });
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` + params;
            const res = await fetch(url);
            const data = await res.json();
            const feat = data.features?.[0];
            if (!feat) throw new Error('No se encontró: ' + query);
            return feat.routable_points?.points?.[0]?.coordinates || feat.center;
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

        document.getElementById('calcRouteBtn').addEventListener('click', async () => {
            const oText = document.getElementById('originSelect').value?.trim();
            const dText = document.getElementById('destSelect').value?.trim();
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