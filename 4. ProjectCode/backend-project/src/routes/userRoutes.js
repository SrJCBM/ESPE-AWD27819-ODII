const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { cacheMiddleware } = require('../middlewares/cache');

/**
 * User Routes
 */

// GET /users - Get all users (with cache)
router.get('/users', cacheMiddleware(300), userController.getAllUsers);

// GET /users/:id - Get user by ID (with cache)
router.get('/users/:id', cacheMiddleware(300), userController.getUserById);

// POST /users - Create new user
router.post('/users', userController.createUser);

// PUT /users/:id - Update user by ID
router.put('/users/:id', userController.updateUser);

// DELETE /users/:id - Delete user by ID
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
