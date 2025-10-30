// public/assets/js/weather.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const destSelect = document.getElementById('weatherDest');
    const getBtn = document.getElementById('getWeatherBtn');
    const saveBtn = document.getElementById('saveWeatherBtn');
    const result = document.getElementById('weatherResult');

    // Poblado de destinos
    window.app?.populateDestinationSelect && window.app.populateDestinationSelect('weatherDest', true);

    // Obtener clima simulado
    getBtn.addEventListener('click', () => {
      const id = destSelect.value;
      if (!id) { alert('Selecciona un destino'); return; }
      const data = window.app?.getSimulatedWeather ? window.app.getSimulatedWeather(id) : { error: 'Simulador no disponible' };
      result.textContent = JSON.stringify(data, null, 2);
      saveBtn.style.display = 'inline-block';
      window.currentWeather = data;
    });

    // Guardar registro
    saveBtn.addEventListener('click', () => {
      if (!window.currentWeather) { alert('Primero genera un clima'); return; }
      if (!window.app?.saveWeather) { alert('Módulo de clima no disponible'); return; }
      window.app.saveWeather(window.currentWeather);
      window.app.renderWeatherRecords && window.app.renderWeatherRecords();
    });

    // Render inicial de registros
    window.app?.renderWeatherRecords && window.app.renderWeatherRecords();
  });
})();
