// public/assets/js/itinerary.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Poblado de viajes disponibles
    if (window.app?.populateTripSelect) {
      window.app.populateTripSelect('itTripSelect');
    }

    const genBtn = document.getElementById('genItBtn');
    const saveBtn = document.getElementById('saveItBtn');
    const exportBtn = document.getElementById('exportItBtn');
    const view = document.getElementById('itineraryView');

    genBtn.addEventListener('click', async () => {
      const tripId = document.getElementById('itTripSelect').value;
      const days = parseInt(document.getElementById('itDays').value || '1', 10);
      if (!tripId) { alert('Selecciona un viaje'); return; }

      const it = window.app?.generateItinerary
        ? await window.app.generateItinerary(tripId, days)
        : { html: '<p>No hay generador disponible.</p>', data: null };

      view.innerHTML = it.html;
      window.currentItinerary = it;
      saveBtn.style.display = 'inline-block';
      exportBtn.style.display = 'inline-block';
    });

    saveBtn.addEventListener('click', () => {
      if (!window.currentItinerary) { alert('Genera un itinerario primero'); return; }
      if (window.app?.saveItinerary) {
        window.app.saveItinerary(window.currentItinerary);
        alert('Itinerario guardado');
      } else {
        alert('Módulo de guardado no disponible');
      }
    });

    exportBtn.addEventListener('click', () => window.print());
  });
})();
