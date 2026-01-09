// TravelBrain - Authentication JavaScript

ready(() => {
  console.log('Auth page loaded');

  // Apply background image from data attribute with fixed positioning
  const illustration = document.querySelector('.auth-illustration');
  if (illustration && illustration.dataset.bg) {
    const bgUrl = illustration.dataset.bg;
    illustration.style.setProperty('--bg-image', `url('${bgUrl}')`);
    const beforePseudo = document.createElement('style');
    beforePseudo.textContent = `
      .auth-illustration::before {
        background-image: url('${bgUrl}') !important;
      }
    `;
    document.head.appendChild(beforePseudo);
  }

  // Check if already authenticated
  if (isAuthenticated()) {
    redirectTo('dashboard.html');
    return;
  }

  // Handle Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Handle Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const btn = document.getElementById('loginBtn');
  const formData = getFormData(form);

  // Validate
  if (!isValidEmail(formData.email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  if (!formData.password || formData.password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  // Set loading state
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    // Call API
    const response = await apiPost(CONFIG.ENDPOINTS.LOGIN, {
      email: formData.email,
      password: formData.password
    });

    if (response.success && response.token) {
      // Save token and user
      saveToken(response.token);
      saveUser(response.user);

      // Show success
      showToast(`Welcome back, ${response.user.name || response.user.username}!`, 'success');

      // Redirect to dashboard
      setTimeout(() => {
        redirectTo('dashboard.html');
      }, 1000);
    } else {
      showToast(response.message || 'Login failed', 'error');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Login failed. Please try again.', 'error');
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const btn = document.getElementById('registerBtn');
  const formData = getFormData(form);

  // Validate
  if (!isValidEmail(formData.email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  if (formData.username.length < 3) {
    showToast('Username must be at least 3 characters', 'error');
    return;
  }

  if (!formData.name || formData.name.trim().length < 2) {
    showToast('Please enter your full name', 'error');
    return;
  }

  if (!formData.password || formData.password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  // Set loading state
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    // First, login to create/get user (using simple login endpoint)
    const loginResponse = await apiPost(CONFIG.ENDPOINTS.LOGIN, {
      email: formData.email,
      password: formData.password
    });

    if (loginResponse.success && loginResponse.token) {
      // Save token temporarily
      saveToken(loginResponse.token);

      // Update user profile with full information
      const userId = loginResponse.user._id;
      
      try {
        await apiPut(CONFIG.ENDPOINTS.USER_BY_ID(userId), {
          username: formData.username,
          name: formData.name,
          email: formData.email
        });

        // Update saved user
        const updatedUser = {
          ...loginResponse.user,
          username: formData.username,
          name: formData.name
        };
        saveUser(updatedUser);

        // Show success
        showToast(`Welcome to TravelBrain, ${formData.name}!`, 'success');

        // Redirect to dashboard
        setTimeout(() => {
          redirectTo('dashboard.html');
        }, 1500);
      } catch (updateError) {
        console.error('Profile update error:', updateError);
        // Still proceed to dashboard with original user data
        saveUser(loginResponse.user);
        showToast(`Welcome to TravelBrain!`, 'success');
        setTimeout(() => {
          redirectTo('dashboard.html');
        }, 1500);
      }
    } else {
      showToast('Registration failed. Please try again.', 'error');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast(error.message || 'Registration failed. Please try again.', 'error');
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// Real-time email validation
const emailInputs = document.querySelectorAll('input[type="email"]');
emailInputs.forEach(input => {
  input.addEventListener('blur', function() {
    if (this.value && !isValidEmail(this.value)) {
      this.classList.add('error');
      showFormError(this, 'Please enter a valid email address');
    } else {
      this.classList.remove('error');
      clearFormError(this);
    }
  });

  input.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      clearFormError(this);
      this.classList.remove('error');
    }
  });
});

// Real-time username validation
const usernameInput = document.getElementById('username');
if (usernameInput) {
  usernameInput.addEventListener('blur', function() {
    if (this.value && this.value.length < 3) {
      this.classList.add('error');
      showFormError(this, 'Username must be at least 3 characters');
    } else {
      this.classList.remove('error');
      clearFormError(this);
    }
  });

  usernameInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      clearFormError(this);
      this.classList.remove('error');
    }
  });
}
