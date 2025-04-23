// authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db'); // Add this import

const { createUser, getUserByUsername } = require('../models/userModel');

// In authController.js
const registerUser = async (req, res) => {
  try {
    console.log('Registration request received:', {
      username: req.body.username,
      email: req.body.email,
      fullName: req.body.fullName
    });

    // Validate input
    const requiredFields = ['username', 'password', 'fullName', 'email'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if user exists
    const existingUser = await getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Check if email exists
    const existingEmail = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [req.body.email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    console.log('Password hashed successfully');

    // Create user
    const newUser = await pool.query(
      `INSERT INTO users 
      (username, password, full_name, email, address, is_admin) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, username, email, full_name, is_admin`,
      [
        req.body.username,
        hashedPassword,
        req.body.fullName,
        req.body.email,
        req.body.address || null,
        false
      ]
    );

    if (!newUser.rows[0]) {
      throw new Error('User creation failed - no data returned');
    }

    const user = newUser.rows[0];
    console.log('User created successfully:', user.id);

    // Generate token
    const token = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
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
