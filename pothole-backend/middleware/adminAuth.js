// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    console.log('🛡️ === ADMIN MIDDLEWARE TRIGGERED ===');
    
    const authHeader = req.headers['authorization'];
    console.log('🛡️ Auth header exists:', !!authHeader);
    
    if (!authHeader) {
      console.log('🛡️ ❌ No authorization header');
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🛡️ Token extracted:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('🛡️ ❌ No token in header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🛡️ JWT Secret from env:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    
    // Verify token with detailed error handling
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🛡️ ✅ Token verified successfully');
      console.log('🛡️ Decoded user:', decoded.user);
      
      // Check admin role
      if (decoded.user.role !== 'admin') {
        console.log('🛡️ ❌ User role is not admin:', decoded.user.role);
        return res.status(403).json({ message: 'Admin role required' });
      }
      
      console.log('🛡️ ✅ Admin access granted for:', decoded.user.username);
      req.user = decoded.user;
      next();
      
    } catch (jwtError) {
      console.log('🛡️ ❌ JWT Verification failed:', jwtError.message);
      console.log('🛡️ JWT Error name:', jwtError.name);
      return res.status(403).json({ 
        message: 'Token verification failed',
        error: jwtError.message 
      });
    }
    
  } catch (error) {
    console.error('🛡️ 💥 Unexpected error in admin middleware:', error);
    res.status(500).json({ message: 'Server error in admin middleware' });
  }
};

module.exports = { requireAdmin };