const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Authentication Routes
 */

// POST /api/auth/google-login - Google OAuth login
router.post('/api/auth/google-login', authController.googleLogin);

// GET /api/auth/verify - Verify JWT token
router.get('/api/auth/verify', authController.verifyToken);

module.exports = router;
