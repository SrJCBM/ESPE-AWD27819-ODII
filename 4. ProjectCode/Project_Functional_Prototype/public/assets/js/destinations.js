(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('destForm');
    const search = document.getElementById('searchDest');

    if (window.app?.renderDestinations) {
      window.app.renderDestinations();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('destId').value || null;
      const dest = {
        id,
        name: document.getElementById('destName').value.trim(),
        country: document.getElementById('destCountry').value.trim(),
        description: document.getElementById('destDesc').value.trim(),
        lat: parseFloat(document.getElementById('destLat').value) || null,
        lng: parseFloat(document.getElementById('destLng').value) || null,
        img: document.getElementById('destImg').value.trim()
      };

      if (!window.app?.saveDestination) {
        alert('Módulo de destinos no disponible');
        return;
      }

      window.app.saveDestination(dest);
      form.reset();
      window.app.renderDestinations();
    });

    search.addEventListener('input', (e) => {
      window.app?.renderDestinations && window.app.renderDestinations(e.target.value);
    });
  });
})();
