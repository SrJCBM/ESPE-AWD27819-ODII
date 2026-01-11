import api from './api'
import { API_CONFIG } from '../config'

export const weatherService = {
  // Get all weather searches
  getAllWeatherSearches: async () => {
    const response = await api.get(API_CONFIG.ENDPOINTS.WEATHERS)
    return response.data
  },

  // Get weather by ID
  getWeatherById: async (id) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.WEATHER_BY_ID(id))
    return response.data
  },

  // Create new weather search
  createWeatherSearch: async (weatherData) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.WEATHER_SEARCH, weatherData)
    return response.data
  },

  // Update weather
  updateWeather: async (id, weatherData) => {
    const response = await api.put(API_CONFIG.ENDPOINTS.WEATHER_BY_ID(id), weatherData)
    return response.data
  },

  // Delete weather
  deleteWeather: async (id) => {
    const response = await api.delete(API_CONFIG.ENDPOINTS.WEATHER_BY_ID(id))
    return response.data
  }
}
