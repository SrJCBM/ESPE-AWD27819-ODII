const User = require('../models/User');
const { invalidateCache } = require('../utils/cache');

/**
 * Get all users
 * @route GET /users
 */
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find();
    console.log(`Found ${users.length} user records`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user by ID
 * @route GET /users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create new user
 * @route POST /users
 */
exports.createUser = async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      passwordHash: req.body.passwordHash,
      name: req.body.name,
      role: req.body.role,
      status: req.body.status,
      tz: req.body.tz,
      createdAt: req.body.createdAt
    });

    const savedUser = await user.save();
    invalidateCache('/users');
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update user by ID
 * @route PUT /users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    console.log(`Updating user with id: ${req.params.id}`);
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (req.body.username != null) user.username = req.body.username;
    if (req.body.email != null) user.email = req.body.email;
    if (req.body.passwordHash != null) user.passwordHash = req.body.passwordHash;
    if (req.body.name != null) user.name = req.body.name;
    if (req.body.role != null) user.role = req.body.role;
    if (req.body.status != null) user.status = req.body.status;
    if (req.body.tz != null) user.tz = req.body.tz;

    const updatedUser = await user.save();
    console.log('User updated successfully');
    invalidateCache('/users');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete user by ID
 * @route DELETE /users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    console.log(`Deleting user with id: ${req.params.id}`);
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    console.log('User deleted successfully');
    invalidateCache('/users');
    res.json({ message: 'User deleted successfully', deletedId: req.params.id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};
