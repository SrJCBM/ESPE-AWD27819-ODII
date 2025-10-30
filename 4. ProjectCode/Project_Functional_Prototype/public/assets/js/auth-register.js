(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
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

      try {
        const res = await window.Auth.register(data);
        if (!res.ok) throw new Error(res.msg || 'Error en el registro');
        location.href = '/auth/login?registered=1';
      } catch (err) {
        alert(err.message || 'Error en el registro');
      }
    });
  });
})();
