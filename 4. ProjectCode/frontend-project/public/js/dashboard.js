// TravelBrain - Dashboard JavaScript

ready(async () => {
  console.log('Dashboard page loaded');

  // Check authentication
  if (!isAuthenticated()) {
    redirectTo('login.html');
    return;
  }

  // Initialize dashboard
  await initDashboard();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Initialize dashboard
 */
async function initDashboard() {
  const user = getUser();
  
  if (!user) {
    logout();
    return;
  }

  // Update user info in navbar
  updateUserInfo(user);
  
  // Load dashboard data
  await Promise.all([
    loadStats(),
    loadRecentTrips(),
    loadDestinations()
  ]);
}

/**
 * Update user information in navbar
 */
function updateUserInfo(user) {
  const userNameEl = document.getElementById('userName');
  const userInitialsEl = document.getElementById('userInitials');
  const welcomeUserNameEl = document.getElementById('welcomeUserName');
  
  if (userNameEl) {
    userNameEl.textContent = user.name || user.username || user.email.split('@')[0];
  }
  
  if (userInitialsEl) {
    const name = user.name || user.username || user.email;
    const initials = name.substring(0, 2).toUpperCase();
    userInitialsEl.textContent = initials;
  }
  
  if (welcomeUserNameEl) {
    welcomeUserNameEl.textContent = user.name || user.username || 'Traveler';
  }
}

/**
 * Load dashboard statistics
 */
async function loadStats() {
  try {
    const user = getUser();
    
    // Load trips
    const trips = await apiGet(API_CONFIG.ENDPOINTS.TRIPS);
    const userTrips = trips.filter(trip => trip.user_id === user._id);
    
    // Load destinations
    const destinations = await apiGet(API_CONFIG.ENDPOINTS.DESTINATIONS);
    
    // Load favorite routes
    const favoriteRoutes = await apiGet(API_CONFIG.ENDPOINTS.FAVORITE_ROUTES);
    const userFavorites = favoriteRoutes.filter(route => route.user_id === user._id);
    
    // Count upcoming trips (trips with start_date in the future)
    const now = new Date();
    const upcoming = userTrips.filter(trip => {
      if (trip.start_date) {
        return new Date(trip.start_date) > now;
      }
      return false;
    });
    
    // Update stats
    updateStat('totalTrips', userTrips.length);
    updateStat('totalDestinations', destinations.length);
    updateStat('totalFavorites', userFavorites.length);
    updateStat('upcomingTrips', upcoming.length);
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Update stat value
 */
function updateStat(id, value) {
  const el = document.getElementById(id);
  if (el) {
    // Animate number
    animateNumber(el, 0, value, 800);
  }
}

/**
 * Animate number counter
 */
function animateNumber(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current);
  }, 16);
}

/**
 * Load recent trips
 */
async function loadRecentTrips() {
  const container = document.getElementById('recentTripsContainer');
  
  try {
    const user = getUser();
    const trips = await apiGet(API_CONFIG.ENDPOINTS.TRIPS);
    const userTrips = trips
      .filter(trip => trip.user_id === user._id)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .slice(0, 5);
    
    if (userTrips.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h3 class="empty-state-title">No trips yet</h3>
          <p class="empty-state-description">Start planning your first adventure!</p>
          <a href="/planner.html" class="btn btn-primary">Plan Trip</a>
        </div>
      `;
      return;
    }
    
    container.innerHTML = userTrips.map(trip => {
      const startDate = trip.start_date ? formatDate(trip.start_date) : 'Date not set';
      const isUpcoming = trip.start_date && new Date(trip.start_date) > new Date();
      
      return `
        <div class="trip-item" onclick="window.location.href='/trips.html'">
          <div class="trip-header">
            <div>
              <div class="trip-name">${escapeHtml(trip.name || 'Untitled Trip')}</div>
              <div class="trip-date">${startDate}</div>
            </div>
            ${isUpcoming ? '<span class="trip-badge">Upcoming</span>' : ''}
          </div>
          <div class="trip-destination">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${escapeHtml(trip.destination || 'Unknown destination')}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading trips:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-description">Error loading trips</p>
      </div>
    `;
  }
}

/**
 * Load popular destinations
 */
async function loadDestinations() {
  const container = document.getElementById('destinationsContainer');
  
  try {
    const destinations = await apiGet(API_CONFIG.ENDPOINTS.DESTINATIONS);
    const featured = destinations.slice(0, 6);
    
    if (featured.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h3 class="empty-state-title">No destinations</h3>
        </div>
      `;
      return;
    }
    
    container.innerHTML = featured.map(dest => `
      <div class="destination-card" onclick="window.location.href='/destinations.html'">
        <img 
          src="${dest.image_url || 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(dest.name)}" 
          alt="${escapeHtml(dest.name)}"
          class="destination-image"
          onerror="this.src='https://via.placeholder.com/300x300?text=Image+Not+Found'"
        >
        <div class="destination-overlay">
          <div class="destination-name">${escapeHtml(dest.name)}</div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading destinations:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-description">Error loading destinations</p>
      </div>
    `;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  // User menu toggle
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  
  if (userMenuBtn && userMenuDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdown.style.opacity = '1';
      userMenuDropdown.style.visibility = 'visible';
      userMenuDropdown.style.transform = 'translateY(0)';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
        userMenuDropdown.style.opacity = '0';
        userMenuDropdown.style.visibility = 'hidden';
        userMenuDropdown.style.transform = 'translateY(-10px)';
      }
    });
  }
}
