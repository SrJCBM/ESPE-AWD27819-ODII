// public/assets/js/auth-login.js
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm    = document.getElementById('loginForm');
    const errorModal   = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeBtn     = document.querySelector('.close-error');
    const submitBtn    = loginForm?.querySelector('button[type="submit"]');

    if (!loginForm) return;

    const setBusy = (busy) => {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.classList.toggle('is-loading', busy);
    };

    const setModalVisible = (visible) => {
      if (!errorModal) return;
      errorModal.classList.toggle('is-visible', visible);
      errorModal.setAttribute('aria-hidden', String(!visible));
      if (visible) {
        (closeBtn || errorModal)?.focus?.({ preventScroll: true });
      }
    };

    const showError = (msg) => {
      if (errorMessage) {
        errorMessage.textContent = msg || 'Error de autenticación';
      } else {
        alert(msg || 'Error de autenticación');
      }
      setModalVisible(true);
    };

    const hideError = () => setModalVisible(false);

    // Cerrar modal
    closeBtn?.addEventListener('click', hideError);
    errorModal?.addEventListener('click', (event) => {
      if (event.target === errorModal) hideError();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && errorModal?.classList.contains('is-visible')) {
        hideError();
      }
    });

    // Submit login
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('l_username')?.value.trim();
      const password = document.getElementById('l_password')?.value.trim();

      try {
        if (!window.Auth || typeof window.Auth.login !== 'function') {
          showError('Error: módulo de autenticación no cargado.');
          return;
        }

        setBusy(true);
        const res = await window.Auth.login({ username, password });

        if (!res?.ok) {
          showError(res?.msg || 'Credenciales inválidas');
          return;
        }

        // Login exitoso
        if (typeof window.Auth.renderUserArea === 'function') {
          await window.Auth.renderUserArea();
        }
        location.href = '/';
      } catch (err) {
        console.error('Error en autenticación:', err);
        const message =
          err && typeof err.message === 'string' && err.message.trim()
            ? err.message.trim()
            : 'Ocurrió un error inesperado. Intenta nuevamente.';
        showError(message);
      } finally {
        setBusy(false);
      }
    });
  });
})();
