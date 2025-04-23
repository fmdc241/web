const protect = (req, res, next) => {
  req.user = { id: '123', isAdmin: true }; // Mock user data for testing
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Proceed if admin
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = { protect, admin };
