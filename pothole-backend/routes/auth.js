const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('username').isLength({ min: 3 })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  register
);

// Login
router.post('/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

// Profile
router.get('/profile', authenticateToken, getProfile);

// Logout
router.post('/logout', authenticateToken, logout);

module.exports = router;  