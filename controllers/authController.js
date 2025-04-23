// authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername } = require('../models/userModel');

// In authController.js
const registerUser = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    
    // Validate input
    const required = ['username', 'password', 'fullName', 'email'];
    const missing = required.filter(field => !req.body[field]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        error: `Missing fields: ${missing.join(', ')}`,
        missingFields: missing
      });
    }

    // Check username exists
    const existing = await getUserByUsername(req.body.username);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = await createUser({
      username: req.body.username,
      password: hashedPassword,
      full_name: req.body.fullName,
      email: req.body.email,
      address: req.body.address || null,
      is_admin: false
    });

    if (!user || !user.id) {
      throw new Error('User creation returned invalid data');
    }

    console.log('User created successfully:', user.id);
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });

  } catch (error) {
    console.error('Registration failed:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

module.exports = {
  registerUser,
  loginUser,
  getMe
};
