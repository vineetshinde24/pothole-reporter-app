const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Use the same structure as admin middleware
    req.user = {
      id: decoded.user.id,
      username: decoded.user.username,
      email: decoded.user.email,
      role: decoded.user.role
    };
    
    next();
  });
};

module.exports = { authenticateToken };