(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Render inicial
    window.app?.renderTrips && window.app.renderTrips();
    window.app?.populateDestinationSelect && window.app.populateDestinationSelect('tripDestinations');

    // Guardar viaje
    const form = document.getElementById('tripForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('tripId').value || null;
      const opts = Array.from(document.getElementById('tripDestinations').selectedOptions);
      const destIds = opts.map(o => o.value);

      const trip = {
        id,
        name: (document.getElementById('tripName').value || '').trim(),
        description: (document.getElementById('tripDesc').value || '').trim(),
        destinations: destIds
      };

      if (!trip.name) { alert('Nombre requerido'); return; }
      if (!window.app?.saveTrip) { alert('Módulo de viajes no disponible'); return; }

      window.app.saveTrip(trip);
      form.reset();
      window.app.renderTrips();
    });

    // Búsqueda
    const search = document.getElementById('searchTrip');
    search.addEventListener('input', (e) => {
      window.app?.renderTrips && window.app.renderTrips(e.target.value);
    });
  });
})();
