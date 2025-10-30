(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = {
        username: document.getElementById('r_username').value.trim(),
        password: document.getElementById('r_password').value.trim(),
        firstname: document.getElementById('r_firstname').value.trim(),
        lastname: document.getElementById('r_lastname').value.trim(),
        email: document.getElementById('r_email').value.trim()
      };

      const confirm = document.getElementById('r_password2').value.trim();
      if (data.password !== confirm) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const res = window.Auth?.register
        ? window.Auth.register(data)
        : { ok: false, msg: 'Auth no cargado' };

      if (!res.ok) {
        alert(res.msg || 'Error en el registro');
        return;
      }

      // Redirección con ruta absoluta para funcionar en cualquier nivel
      location.href = '/auth/login?registered=1';
    });
  });
})();
