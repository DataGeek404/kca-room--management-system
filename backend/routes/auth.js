

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Ensure JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set in environment variables. Using default key. Please set JWT_SECRET in production.');
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('role', 'Role is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user exists
      let [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length > 0) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into database
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, 'active']
      );

      const userId = result.insertId;

      // Generate JWT
      const payload = {
        userId: userId
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: userId,
            name: name,
            email: email,
            role: role
          },
          token: token
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      console.log('Login attempt for email:', email);

      // Check if user exists
      let [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        console.log('User not found:', email);
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      const user = users[0];
      console.log('User found:', { id: user.id, email: user.email, role: user.role });

      // Check if password exists in database
      if (!user.password) {
        console.log('Password is null/undefined for user:', email);
        return res.status(400).json({ success: false, message: 'Account configuration error. Please contact administrator.' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('Password mismatch for user:', email);
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate JWT
      const payload = {
        userId: user.id
      };

      console.log('Generating JWT for user:', user.id);
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
      console.log('JWT generated successfully');

      res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: token
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    console.log('Profile request for user:', req.user.id);
    
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ? AND status = "active"',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    console.log('Profile data retrieved:', { id: user.id, role: user.role, name: user.name });

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

module.exports = router;
