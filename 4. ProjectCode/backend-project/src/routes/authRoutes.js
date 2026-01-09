const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Authentication Routes
 */

// POST /api/auth/login - Simple login
router.post('/api/auth/login', authController.simpleLogin);

// GET /api/auth/verify - Verify JWT token
router.get('/api/auth/verify', authController.verifyToken);

module.exports = router;
