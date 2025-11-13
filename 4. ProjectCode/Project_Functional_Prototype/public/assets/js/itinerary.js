// public/assets/js/itinerary.js
(function () {
  document.addEventListener('DOMContentLoaded', async () => {
    // Poblado de viajes disponibles
    if (window.app?.populateTripSelect) {
      await window.app.populateTripSelect('itTripSelect');
    }

    const genBtn = document.getElementById('genItBtn');
    const saveBtn = document.getElementById('saveItBtn');
    const exportBtn = document.getElementById('exportItBtn');
    const view = document.getElementById('itineraryView');

    // Configurar validaciones
    const fieldRules = {
      itTripSelect: { required: true },
      itDays: { required: true, number: true, positiveNumber: true }
    };

    if (window.ValidationUtils) {
      window.ValidationUtils.setupRealTimeValidation(document.body, fieldRules);
    }

    genBtn.addEventListener('click', async () => {
      const tripId = document.getElementById('itTripSelect').value;
      const days = parseInt(document.getElementById('itDays').value || '1', 10);
      const interests = document.getElementById('itInterests')?.value || 'cultura';
      const budgetStyle = document.getElementById('itBudgetStyle')?.value || 'medio';
      
      // Validaciones
      if (!tripId) {
        if (window.ValidationUtils) {
          window.ValidationUtils.showError('Por favor, selecciona un viaje');
          document.getElementById('itTripSelect').classList.add('invalid', 'shake');
          setTimeout(() => document.getElementById('itTripSelect').classList.remove('shake'), 500);
        } else {
          alert('Selecciona un viaje');
        }
        document.getElementById('itTripSelect').focus();
        return;
      }

      if (!days || isNaN(days) || days < 1 || days > 30) {
        if (window.ValidationUtils) {
          window.ValidationUtils.showError('Los días deben ser un número entre 1 y 30');
          document.getElementById('itDays').classList.add('invalid', 'shake');
          setTimeout(() => document.getElementById('itDays').classList.remove('shake'), 500);
        } else {
          alert('Los días deben ser un número entre 1 y 30');
        }
        document.getElementById('itDays').focus();
        return;
      }

      // Limpiar errores de validación
      document.getElementById('itTripSelect').classList.remove('invalid');
      document.getElementById('itDays').classList.remove('invalid');

      // Mostrar indicador de carga
      view.innerHTML = '<div class="loading"><p>🤖 Generando itinerario inteligente...</p><p><em>Esto puede tomar unos segundos</em></p></div>';

      // Deshabilitar botón durante la generación
      const originalText = genBtn.textContent;
      genBtn.disabled = true;
      genBtn.textContent = 'Generando...';

      try {
        const it = window.app?.generateItinerary
          ? await window.app.generateItinerary(tripId, days, interests, budgetStyle)
          : { html: '<p>No hay generador disponible.</p>', data: null };

        view.innerHTML = it.html;
        window.currentItinerary = it;
        saveBtn.style.display = 'inline-block';
        exportBtn.style.display = 'inline-block';
        
        // Mostrar mensaje de éxito
        if (window.ValidationUtils) {
          window.ValidationUtils.showSuccess('Itinerario generado exitosamente');
        }
        
      } catch (error) {
        console.error('Error generando itinerario:', error);
        view.innerHTML = '<div class="error"><p>❌ Error generando el itinerario</p><p>Inténtalo de nuevo en unos segundos.</p></div>';
        
        if (window.ValidationUtils) {
          window.ValidationUtils.showError('Error generando el itinerario. Inténtalo de nuevo.');
        }
      } finally {
        // Restaurar botón
        genBtn.disabled = false;
        genBtn.textContent = originalText;
      }
    });

    saveBtn.addEventListener('click', () => {
      if (!window.currentItinerary) {
        if (window.ValidationUtils) {
          window.ValidationUtils.showError('Genera un itinerario primero');
        } else {
          alert('Genera un itinerario primero');
        }
        return;
      }
      
      if (window.app?.saveItinerary) {
        window.app.saveItinerary(window.currentItinerary);
        if (window.ValidationUtils) {
          window.ValidationUtils.showSuccess('Itinerario guardado exitosamente');
        } else {
          alert('Itinerario guardado');
        }
      } else {
        if (window.ValidationUtils) {
          window.ValidationUtils.showError('Módulo de guardado no disponible');
        } else {
          alert('Módulo de guardado no disponible');
        }
      }
    });

    exportBtn.addEventListener('click', () => window.print());
  });
})();
