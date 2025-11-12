(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('destForm');
    const search = document.getElementById('searchDest');
    const listEl = document.getElementById('destList');

    // Renderizar destinos iniciales
    renderDestinations();

    // Habilitar autocompletado con Mapbox si está disponible
    try {
      if (globalThis.MapboxAutocomplete && typeof MapboxAutocomplete.wire === 'function') {
        MapboxAutocomplete.wire('destName', 'destNameList', (feature, meta) => {
          try {
            const placeName = feature.place_name || '';
            const parts = placeName.split(',').map(s => s.trim()).filter(Boolean);
            const city = parts[0] || '';
            const country = (meta && meta.country) ? meta.country : (parts.length > 1 ? parts[parts.length - 1] : '');
            document.getElementById('destName').value = city;
            if (document.getElementById('destCountry')) document.getElementById('destCountry').value = country;
            if (Array.isArray(feature.center) && feature.center.length >= 2) {
              const lon = feature.center[0];
              const lat = feature.center[1];
              const latEl = document.getElementById('destLat');
              const lngEl = document.getElementById('destLng');
              if (latEl) latEl.value = String(lat);
              if (lngEl) lngEl.value = String(lon);
            }
            // Intentar obtener imagen automática si img está vacío
            const imgEl = document.getElementById('destImg');
            if (imgEl && !imgEl.value && globalThis.PlaceImage) {
              PlaceImage.imageForPlace(city, country).then(url => { if (url) imgEl.value = url; }).catch(()=>{});
            }
          } catch (e) { console.warn('Mapbox select failed in destinations:', e); }
        });
      }
    } catch (e) { /* silencioso */ }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('destId').value || null;
      const dest = {
        name: document.getElementById('destName').value.trim(),
        country: document.getElementById('destCountry').value.trim(),
        description: normalizeDescription(document.getElementById('destDesc').value),
        lat: document.getElementById('destLat').value ? parseFloat(document.getElementById('destLat').value) : null,
        lng: document.getElementById('destLng').value ? parseFloat(document.getElementById('destLng').value) : null,
        img: document.getElementById('destImg').value.trim() || null
      };

      try {
        // Front validation: ensure description present (A) and warn if empty (C)
        if (!dest.description || dest.description.length < 2) {
          alert('La descripción es obligatoria y debe tener al menos 2 caracteres.');
          const descEl = document.getElementById('destDesc');
          descEl && descEl.focus();
          return;
        }
        if (id) {
          // Actualizar
          await window.DestinationsAPI.update(id, dest);
          alert('Destino actualizado');
        } else {
          // Crear
          await window.DestinationsAPI.create(dest);
          alert('Destino creado');
        }
        form.reset();
        document.getElementById('destId').value = '';
        renderDestinations();
      } catch (err) {
        alert(err.message || 'Error al guardar destino');
      }
    });

    search.addEventListener('input', (e) => {
      renderDestinations(e.target.value);
    });

    async function renderDestinations(filter = '') {
      if (!listEl) return;
      
      listEl.innerHTML = '<li>Cargando...</li>';
      
      try {
        const res = await window.DestinationsAPI.list(filter);
        const destinations = res.items || [];
        
        listEl.innerHTML = '';
        
        if (destinations.length === 0) {
          listEl.innerHTML = '<li>No hay destinos registrados</li>';
          return;
        }

        for (const d of destinations) {
          const li = document.createElement('li');
          li.innerHTML = `
            <div>
              <strong>${d.name || ''}</strong> <small>${d.country || ''}</small><br>
              <small>${formatDescription(d.description || '')}</small>
              ${d.lat && d.lng ? `<br><small>📍 ${d.lat}, ${d.lng}</small>` : ''}
            </div>
            <div>
              <button class="editDest" data-id="${d._id}">Editar</button>
              <button class="delDest" data-id="${d._id}">Eliminar</button>
            </div>
          `;
          listEl.appendChild(li);
        }

        // Bind eventos de editar y eliminar
        listEl.querySelectorAll('.delDest').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            if (!confirm('¿Eliminar este destino?')) return;
            try {
              await window.DestinationsAPI.delete(id);
              alert('Destino eliminado');
              renderDestinations(filter);
            } catch (err) {
              alert(err.message || 'Error al eliminar');
            }
          });
        });

        listEl.querySelectorAll('.editDest').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            try {
              const res = await window.DestinationsAPI.get(id);
              const d = res.destination;
              
              document.getElementById('destId').value = d._id;
              document.getElementById('destName').value = d.name || '';
              document.getElementById('destCountry').value = d.country || '';
              document.getElementById('destDesc').value = d.description || '';
              document.getElementById('destLat').value = d.lat || '';
              document.getElementById('destLng').value = d.lng || '';
              document.getElementById('destImg').value = d.img || '';
              
              window.scrollTo(0, 0);
            } catch (err) {
              alert(err.message || 'Error al cargar destino');
            }
          });
        });
      } catch (err) {
        listEl.innerHTML = `<li>Error: ${err.message || 'No se pudieron cargar los destinos'}</li>`;
      }
    }
  });

  // Helpers
  function normalizeDescription(text){
    const raw = (text || '').replace(/\r\n?/g, '\n');
    // collapse multiple blank lines, trim ends but keep one trailing newline removed
    let cleaned = raw.split('\n').map(l => l.trimEnd()).join('\n');
    cleaned = cleaned.trim();
    return cleaned;
  }

  function formatDescription(text){
    if (!text) return '';
    // Replace newlines with <br> for display, escape basic entities
    const esc = text
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
    return esc.replace(/\n+/g,'<br>');
  }
})();
