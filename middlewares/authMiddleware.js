// authMiddleware.js
const jwt = require('jsonwebtoken');
const { getUserById } = require('../models/userModel');

const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    const message = error.name === 'TokenExpiredError' 
      ? 'Token expired' 
      : 'Invalid token';

    res.status(401).json({
      success: false,
      error: message
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Continue to the next middleware or route handler
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = { protect, admin };
