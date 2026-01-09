// TravelBrain - Configuration

const CONFIG = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3004',
  API_TIMEOUT: 30000,

  // Authentication
  TOKEN_KEY: 'travelbrain_token',
  USER_KEY: 'travelbrain_user',

  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    VERIFY: '/api/auth/verify',

    // Users
    USERS: '/users',
    USER_BY_ID: (id) => `/users/${id}`,

    // Destinations
    DESTINATIONS: '/destinations',
    DESTINATION_BY_ID: (id) => `/destinations/${id}`,

    // Trips
    TRIPS: '/trips',
    TRIP_BY_ID: (id) => `/trips/${id}`,

    // Favorite Routes
    FAVORITE_ROUTES: '/favorite-routes',
    FAVORITE_ROUTE_BY_ID: (id) => `/favorite-routes/${id}`,

    // Weather
    WEATHER: '/weather',
    WEATHERS: '/weathers',
    WEATHER_BY_ID: (id) => `/weathers/${id}`,

    // Health
    HEALTH: '/health'
  },

  // App Settings
  DEFAULT_TIMEZONE: 'America/Guayaquil',
  CURRENCY_DEFAULT: 'USD',
  
  // Map Settings (if using Mapbox)
  MAPBOX_TOKEN: 'pk.eyJ1Ijoic3JqY2JtIiwiYSI6ImNtZ3g0eGV5NDAwZzYya3BvdmFveWU2dnEifQ.yYCrLmlo9lW-AJf56akVCw',
  
  // Weather API
  OPENWEATHER_KEY: '51355211649b0894257fe06250faa40d',

  // UI Settings
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
