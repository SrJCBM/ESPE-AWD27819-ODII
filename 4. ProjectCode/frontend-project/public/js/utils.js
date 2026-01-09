// TravelBrain - Utility Functions

// ============================================================
// API Utilities
// ============================================================

/**
 * Makes an HTTP request to the API
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * PUT request
 */
async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * DELETE request
 */
async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

// ============================================================
// Authentication Utilities
// ============================================================

/**
 * Save token to localStorage
 */
function saveToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

/**
 * Get token from localStorage
 */
function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

/**
 * Remove token from localStorage
 */
function removeToken() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
}

/**
 * Save user data to localStorage
 */
function saveUser(user) {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
function getUser() {
  const user = localStorage.getItem(CONFIG.USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Remove user data from localStorage
 */
function removeUser() {
  localStorage.removeItem(CONFIG.USER_KEY);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getToken();
}

/**
 * Logout user
 */
function logout() {
  removeToken();
  removeUser();
  window.location.href = 'index.html';
}

/**
 * Verify token validity
 */
async function verifyToken() {
  try {
    const response = await apiGet(CONFIG.ENDPOINTS.VERIFY);
    return response.success;
  } catch (error) {
    removeToken();
    removeUser();
    return false;
  }
}

// ============================================================
// UI Utilities
// ============================================================

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, CONFIG.TOAST_DURATION);
}

/**
 * Show loading spinner
 */
function showLoading(container) {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.id = 'loading-spinner';
  container.appendChild(spinner);
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.remove();
}

/**
 * Debounce function
 */
function debounce(func, delay = CONFIG.DEBOUNCE_DELAY) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Format date
 */
function formatDate(dateString, includeTime = false) {
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  return date.toLocaleDateString('es-ES', options);
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = CONFIG.CURRENCY_DEFAULT) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Validate email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Get form data as object
 */
function getFormData(formElement) {
  const formData = new FormData(formElement);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

/**
 * Set form data from object
 */
function setFormData(formElement, data) {
  Object.keys(data).forEach(key => {
    const input = formElement.elements[key];
    if (input) {
      input.value = data[key];
    }
  });
}

/**
 * Clear form
 */
function clearForm(formElement) {
  formElement.reset();
}

/**
 * Show form error
 */
function showFormError(inputElement, message) {
  const errorElement = inputElement.nextElementSibling;
  if (errorElement && errorElement.classList.contains('form-error')) {
    errorElement.textContent = message;
  } else {
    const error = document.createElement('span');
    error.className = 'form-error';
    error.textContent = message;
    inputElement.parentNode.insertBefore(error, inputElement.nextSibling);
  }
  inputElement.classList.add('error');
}

/**
 * Clear form error
 */
function clearFormError(inputElement) {
  const errorElement = inputElement.nextElementSibling;
  if (errorElement && errorElement.classList.contains('form-error')) {
    errorElement.remove();
  }
  inputElement.classList.remove('error');
}

/**
 * Redirect to page
 */
function redirectTo(page) {
  window.location.href = page;
}

/**
 * Get query parameter from URL
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set query parameter in URL
 */
function setQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}

// ============================================================
// DOM Utilities
// ============================================================

/**
 * Wait for DOM to be ready
 */
function ready(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

/**
 * Create element with attributes
 */
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      element.className = attributes[key];
    } else if (key === 'innerHTML') {
      element.innerHTML = attributes[key];
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  
  return element;
}
