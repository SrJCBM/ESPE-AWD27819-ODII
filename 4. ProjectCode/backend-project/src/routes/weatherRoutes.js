const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { cacheMiddleware } = require('../middlewares/cache');

/**
 * Weather Routes
 */

// GET /weathers - Get all weather searches (with cache)
router.get('/weathers', cacheMiddleware(600), weatherController.getAllWeathers);

// GET /weathers/:id - Get weather by ID (with cache)
router.get('/weathers/:id', cacheMiddleware(600), weatherController.getWeatherById);

// POST /weather - Create new weather search
router.post('/weather', weatherController.createWeather);

// PUT /weathers/:id - Update weather by ID
router.put('/weathers/:id', weatherController.updateWeather);

// DELETE /weathers/:id - Delete weather by ID
router.delete('/weathers/:id', weatherController.deleteWeather);

module.exports = router;
