const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verify error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Shape A (nested):  jwt.sign({ user: { id, username, email, role } }, secret)
    // Shape B (flat):    jwt.sign({ id, username, email, role }, secret)
    const userData = decoded.user || decoded;

    if (!userData?.id) {
      console.error('JWT payload missing user id. Decoded:', JSON.stringify(decoded));
      return res.status(403).json({ message: 'Invalid token payload' });
    }

    req.user = {
      id:       userData.id,
      username: userData.username,
      email:    userData.email,
      role:     userData.role,
    };

    next();
  });
};

module.exports = { authenticateToken };