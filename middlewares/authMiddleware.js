const jwt = require('jsonwebtoken');
const { getUserById } = require('../models/userModel');

const protect = async (req, res, next) => {
  const token = extractToken(req);
  
  if (!token) {
    return sendAuthError(res, 'No token provided');
  }

  try {
    const decoded = verifyToken(token);
    const user = await fetchUser(decoded.id);
    
    if (!user) {
      return sendAuthError(res, 'User not found');
    }

    attachUserToRequest(req, user);
    logAuthSuccess(user.id);
    next();
  } catch (error) {
    handleAuthError(error, res);
  }
};

const admin = (req, res, next) => {
  if (!req.user) {
    return sendAuthError(res, 'User not authenticated');
  }

  if (req.user.is_admin) {
    logAdminAccess(req.user.id);
    next();
  } else {
    sendForbiddenError(res, 'Admin privileges required');
  }
};

// Helper functions
function extractToken(req) {
  return req.headers.authorization?.split(' ')[1];
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
}

async function fetchUser(userId) {
  try {
    return await getUserById(userId);
  } catch (error) {
    console.error('User fetch error:', error);
    return null;
  }
}

function attachUserToRequest(req, user) {
  req.user = {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin
    // Add other necessary user fields
  };
}

function logAuthSuccess(userId) {
  console.log(`Auth success for user ${userId} at ${new Date().toISOString()}`);
}

function logAdminAccess(userId) {
  console.log(`Admin access granted to user ${userId}`);
}

function sendAuthError(res, message) {
  console.warn('Authentication failed:', message);
  return res.status(401).json({ 
    success: false,
    error: message
  });
}

function sendForbiddenError(res, message) {
  console.warn('Forbidden access:', message);
  return res.status(403).json({
    success: false,
    error: message
  });
}

function handleAuthError(error, res) {
  console.error('Authentication error:', {
    name: error.name,
    message: error.message,
    expiredAt: error.expiredAt,
    timestamp: new Date().toISOString()
  });

  const message = error.name === 'TokenExpiredError' 
    ? 'Token expired' 
    : 'Invalid token';

  sendAuthError(res, message);
}

module.exports = { protect, admin };