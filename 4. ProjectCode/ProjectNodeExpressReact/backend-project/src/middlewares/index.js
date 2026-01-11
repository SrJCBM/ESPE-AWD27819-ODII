/**
 * Middlewares Index
 * Central export point for all middlewares
 */

const { cacheMiddleware, invalidateCache, invalidateCacheKey, clearCache, getCacheStats } = require('./cache');
const corsMiddleware = require('./cors');
const { notFoundHandler, errorHandler } = require('./errorHandler');
const requestLogger = require('./requestLogger');

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateCacheKey,
  clearCache,
  getCacheStats,
  corsMiddleware,
  notFoundHandler,
  errorHandler,
  requestLogger
};
