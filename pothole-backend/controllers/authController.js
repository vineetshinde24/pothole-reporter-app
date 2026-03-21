const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Registration attempt:', { username, email });

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });
    
    if (user) {
      if (user.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'User with this email already exists' });
      } else {
        return res.status(400).json({ message: 'User with this username already exists' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await user.save();
    
    console.log('User registered successfully:', user._id);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Include username AND role in JWT token
    const token = jwt.sign(
      { 
        user: { 
          id: user.id, 
          email: user.email,
          username: user.username,
          role: user.role
        } 
      },
      process.env.JWT_SECRET, // Make sure this matches
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};