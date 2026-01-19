// public/assets/js/profile.js
(function() {
  'use strict';

  let currentUser = null;

  document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadUserLevel();
    setupEventListeners();
  });

  /**
   * Carga el perfil del usuario actual
   */
  async function loadProfile() {
    try {
      // Obtener datos del usuario
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await response.json();

      if (!data.ok || !data.user) {
        window.location.href = '/auth/login';
        return;
      }

      currentUser = data.user;
      displayProfile(currentUser);
      await loadUserStats();

    } catch (error) {
      console.error('Error cargando perfil:', error);
      showToast('Error al cargar el perfil', 'error');
    }
  }

  /**
   * Muestra los datos del perfil en la UI
   */
  function displayProfile(user) {
    // Avatar con iniciales
    const initials = getInitials(user.firstname, user.lastname, user.username);
    document.getElementById('avatarInitials').textContent = initials;

    // Info principal
    const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ') || user.username;
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = user.email;

    // Badge de rol
    const roleBadge = document.getElementById('profileRole');
    roleBadge.textContent = user.role === 'ADMIN' ? 'Administrador' : 'Usuario';
    roleBadge.className = 'profile-badge ' + (user.role === 'ADMIN' ? 'admin' : 'user');

    // Formulario de edición
    document.getElementById('editFirstname').value = user.firstname || '';
    document.getElementById('editLastname').value = user.lastname || '';
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editEmail').value = user.email || '';
  }

  /**
   * Obtiene las iniciales del usuario
   */
  function getInitials(firstname, lastname, username) {
    if (firstname && lastname) {
      return (firstname[0] + lastname[0]).toUpperCase();
    }
    if (firstname) {
      return firstname.substring(0, 2).toUpperCase();
    }
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return '??';
  }

  /**
   * Carga estadísticas del usuario
   */
  async function loadUserStats() {
    try {
      const [destinations, trips, routes, ratings] = await Promise.all([
        fetchCount('/api/destinations/1/1'),
        fetchCount('/api/trips/1/1'),
        fetchCount('/api/routes/favorites/1/1'),
        fetchCount('/api/users/me/rates/1/1')
      ]);

      document.getElementById('statDestinations').textContent = destinations;
      document.getElementById('statTrips').textContent = trips;
      document.getElementById('statRoutes').textContent = routes;
      document.getElementById('statRatings').textContent = ratings;

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  /**
   * Helper para obtener el total de una colección
   */
  async function fetchCount(url) {
    try {
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      return data.total || data.items?.length || 0;
    } catch {
      return 0;
    }
  }

  // =====================================================
  // BUSINESS RULE: User Level Calculator
  // Regla de Negocio Calculada: Sistema de Niveles de Usuario
  // =====================================================
  // BR-LEVEL-001: Bronze  → 0-100 puntos    → 0% descuento
  // BR-LEVEL-002: Silver  → 101-500 puntos  → 5% descuento
  // BR-LEVEL-003: Gold    → 501-1000 puntos → 10% descuento
  // BR-LEVEL-004: Platinum→ 1001+ puntos    → 15% descuento
  // =====================================================

  /**
   * Carga el nivel del usuario desde el backend
   */
  async function loadUserLevel() {
    try {
      const response = await fetch('/api/users/me/level', { credentials: 'include' });
      const data = await response.json();

      if (data.ok && data.level) {
        displayUserLevel(data.level);
      } else {
        console.warn('No se pudo cargar el nivel del usuario');
      }
    } catch (error) {
      console.error('Error cargando nivel de usuario:', error);
    }
  }

  /**
   * Muestra el nivel del usuario en la UI
   */
  function displayUserLevel(level) {
    // Iconos por nivel
    const levelIcons = {
      'Bronze': '🥉',
      'Silver': '🥈',
      'Gold': '🥇',
      'Platinum': '💎'
    };

    // Colores por nivel
    const levelColors = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2'
    };

    // Actualizar badge de nivel
    const levelBadge = document.getElementById('levelBadge');
    if (levelBadge) {
      levelBadge.className = `level-badge level-${level.level.toLowerCase()}`;
      levelBadge.querySelector('.level-icon').textContent = levelIcons[level.level] || '🥉';
      levelBadge.querySelector('.level-name').textContent = level.level;
    }

    // Actualizar descuento
    const levelDiscount = document.getElementById('levelDiscount');
    if (levelDiscount) {
      levelDiscount.querySelector('.discount-value').textContent = `${level.discountPercentage}%`;
    }

    // Actualizar puntos
    const currentPoints = document.getElementById('currentPoints');
    if (currentPoints) {
      currentPoints.textContent = level.points;
    }

    // Actualizar barra de progreso
    const progressFill = document.getElementById('levelProgressFill');
    const progressText = document.getElementById('progressText');
    const nextLevelText = document.getElementById('nextLevelText');

    if (progressFill) {
      progressFill.style.width = `${level.progressToNextLevel}%`;
      progressFill.style.backgroundColor = levelColors[level.level];
    }

    if (progressText) {
      if (level.level === 'Platinum') {
        progressText.textContent = '¡Has alcanzado el nivel máximo!';
      } else {
        progressText.textContent = `${level.progressToNextLevel}% hacia el siguiente nivel`;
      }
    }

    if (nextLevelText) {
      if (level.nextLevel) {
        nextLevelText.textContent = `Siguiente: ${level.nextLevel} (faltan ${level.pointsToNextLevel} pts)`;
      } else {
        nextLevelText.textContent = '¡Nivel máximo alcanzado!';
      }
    }

    // Actualizar estadísticas del nivel
    document.getElementById('levelTrips').textContent = level.tripsCompleted || 0;
    document.getElementById('levelRatings').textContent = level.ratingsGiven || 0;
    document.getElementById('levelRoutes').textContent = level.routesSaved || 0;
    document.getElementById('levelDestinations').textContent = level.destinationsVisited || 0;

    // Actualizar beneficios
    const benefitsList = document.getElementById('benefitsList');
    if (benefitsList && level.benefits) {
      benefitsList.innerHTML = level.benefits
        .map(benefit => `<li><span class="benefit-check">✓</span> ${benefit}</li>`)
        .join('');
    }

    // Resaltar el tier actual
    document.querySelectorAll('.tier-item').forEach(item => {
      item.classList.remove('current');
      if (item.dataset.tier === level.level.toLowerCase()) {
        item.classList.add('current');
      }
    });
  }

  /**
   * Recalcula el nivel del usuario
   */
  async function recalculateLevel() {
    const btn = document.getElementById('btnRecalculateLevel');
    const originalText = btn.textContent;

    try {
      btn.disabled = true;
      btn.textContent = 'Calculando...';

      const response = await fetch('/api/users/me/level/recalculate', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.ok && data.level) {
        displayUserLevel(data.level);
        showToast('Nivel actualizado correctamente', 'success');
      } else {
        throw new Error(data.error || 'Error al recalcular');
      }
    } catch (error) {
      console.error('Error recalculando nivel:', error);
      showToast(error.message || 'Error al recalcular el nivel', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  /**
   * Configura los event listeners
   */
  function setupEventListeners() {
    // Formulario de perfil
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);

    // Formulario de contraseña
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);

    // Cerrar todas las sesiones
    document.getElementById('btnLogoutAll').addEventListener('click', handleLogoutAll);

    // Eliminar cuenta
    document.getElementById('btnDeleteAccount').addEventListener('click', handleDeleteAccount);

    // Recalcular nivel
    const btnRecalculate = document.getElementById('btnRecalculateLevel');
    if (btnRecalculate) {
      btnRecalculate.addEventListener('click', recalculateLevel);
    }
  }

  /**
   * Maneja la actualización del perfil
   */
  async function handleProfileUpdate(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';
      form.classList.add('loading');

      const data = {
        firstname: document.getElementById('editFirstname').value.trim(),
        lastname: document.getElementById('editLastname').value.trim(),
        username: document.getElementById('editUsername').value.trim(),
        email: document.getElementById('editEmail').value.trim()
      };

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.msg || 'Error al actualizar');
      }

      showToast('Perfil actualizado correctamente', 'success');
      
      // Recargar perfil
      await loadProfile();

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      showToast(error.message || 'Error al actualizar el perfil', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      form.classList.remove('loading');
    }
  }

  /**
   * Maneja el cambio de contraseña
   */
  async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Cambiando...';
      form.classList.add('loading');

      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.msg || 'Error al cambiar contraseña');
      }

      showToast('Contraseña cambiada correctamente', 'success');
      form.reset();

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      showToast(error.message || 'Error al cambiar la contraseña', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      form.classList.remove('loading');
    }
  }

  /**
   * Cierra todas las sesiones del usuario
   */
  async function handleLogoutAll() {
    if (!confirm('¿Estás seguro de cerrar todas tus sesiones? Tendrás que iniciar sesión de nuevo.')) {
      return;
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      showToast('Sesiones cerradas', 'success');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1000);

    } catch (error) {
      showToast('Error al cerrar sesiones', 'error');
    }
  }

  /**
   * Elimina la cuenta del usuario
   */
  async function handleDeleteAccount() {
    const confirmText = prompt('Para eliminar tu cuenta, escribe "ELIMINAR":');
    
    if (confirmText !== 'ELIMINAR') {
      showToast('Operación cancelada', 'info');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar cuenta');
      }

      showToast('Cuenta eliminada. Redirigiendo...', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      showToast(error.message || 'Error al eliminar la cuenta', 'error');
    }
  }

  /**
   * Muestra una notificación toast
   */
  function showToast(message, type = 'info') {
    const colors = {
      success: 'linear-gradient(to right, #00b09b, #96c93d)',
      error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
      info: 'linear-gradient(to right, #4a90e2, #357abd)'
    };

    if (typeof Toastify !== 'undefined') {
      Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: { background: colors[type] || colors.info }
      }).showToast();
    } else {
      alert(message);
    }
  }

})();
