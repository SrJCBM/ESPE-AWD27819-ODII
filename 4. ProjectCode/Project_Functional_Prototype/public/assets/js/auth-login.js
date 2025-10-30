document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorModal = document.getElementById('errorModal');
  const errorMessage = document.getElementById('errorMessage');
  const closeBtn = document.querySelector('.close-error');

  // Función para mostrar mensajes de error
  const showError = (msg) => {
    errorMessage.textContent = msg || 'Error de autenticación';
    errorModal.style.display = 'block';
  };

  // Cerrar el modal de error
  closeBtn.addEventListener('click', () => {
    errorModal.style.display = 'none';
  });

  // Manejar el envío del formulario
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('l_username').value.trim();
    const password = document.getElementById('l_password').value.trim();

    try {
      // Verifica si el módulo Auth está disponible
      if (!window.Auth || typeof window.Auth.login !== 'function') {
        showError('Error: módulo de autenticación no cargado.');
        return;
      }

      // Ejecuta el login
      const res = await window.Auth.login({ username, password });

      if (!res.ok) {
        showError(res.msg || 'Credenciales inválidas');
        return;
      }

      // Si el login es correcto, renderiza y redirige
      if (typeof window.Auth.renderUserArea === 'function') {
        window.Auth.renderUserArea();
      }

      location.href = '/';
    } catch (err) {
      console.error('Error en autenticación:', err);
      showError('Ocurrió un error inesperado. Intenta nuevamente.');
    }
  });
});
