
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const [users] = await pool.execute(
      'SELECT id, email, role, name FROM users WHERE id = ? AND status = "active"',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = users[0];
    console.log('Authenticated user:', { id: req.user.id, role: req.user.role, name: req.user.name });
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    console.log('Checking authorization:', { userRole: req.user.role, requiredRoles: roles });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${roles.join(' or ')}, Current: ${req.user.role}`
      });
    }

    console.log('Authorization successful for user:', req.user.name);
    next();
  };
};

// New middleware for role-based data filtering
const authorizeWithFiltering = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Add user context for filtering
    req.userContext = {
      role: req.user.role,
      userId: req.user.id
    };

    next();
  };
};

module.exports = { authenticateToken, authorize, authorizeWithFiltering };
