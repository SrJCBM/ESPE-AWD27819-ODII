const form = document.getElementById("tripForm");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Creando...";

  const title = document.getElementById("title").value;
  const destination = document.getElementById("destination").value;
  const startDate = document.getElementById("start_date").value;
  const endDate = document.getElementById("end_date").value;
  const budget = document.getElementById("budget").value;
  const description = document.getElementById("description").value;

  try {
    // Use centralized API wrapper and normalized field names
    if (!globalThis.TripsAPI) throw new Error('TripsAPI not loaded');
    await globalThis.TripsAPI.create({
      title,
      destination,
      startDate,
      endDate,
      budget: budget ? parseFloat(budget) : null,
      description: description || ''
    });
    showMessage("¡Viaje creado exitosamente!", "success");
    form.reset();
    if (typeof loadTrips === 'function') {
      setTimeout(() => loadTrips(), 500);
    }
  } catch (err) {
    // Error de red: fallback a localStorage
    console.warn('Error conectando a la API, guardando en modo local:', err.message);
    saveLocalTrip({
      _id: Date.now().toString(),
      title,
      destination,
      startDate,
      endDate,
      budget: budget ? parseFloat(budget) : null,
      description: description || ''
    });
    showMessage('Guardado en modo local (sin conexión): ' + err.message, 'success');
  }

  resetButton();
});

function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
}

function resetButton() {
  submitBtn.disabled = false;
  submitBtn.textContent = "Crear Viaje";
}

// Local storage helper para fallback
function saveLocalTrip(trip) {
  try {
    const all = JSON.parse(localStorage.getItem('trips')) || [];
    all.unshift(trip);
    localStorage.setItem('trips', JSON.stringify(all));
    // Si la lista está cargada, recargar
    if (typeof loadTrips === 'function') {
      setTimeout(() => loadTrips(), 300);
    }
  } catch (e) {
    console.error('No se pudo guardar el viaje localmente:', e.message);
  }
}
