// authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername } = require('../models/userModel');

// In authController.js
const registerUser = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body); // Add this line

    const { username, password, fullName, email, address } = req.body;

    // Add validation
    if (!username || !password || !fullName || !email) {
      console.log('Missing fields:', { username, fullName, email });
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    const userExists = await getUserByUsername(username);
    if (userExists) {
      console.log('Username exists:', username);
      return res.status(400).json({ 
        success: false,
        error: 'Username already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    const user = await createUser({
      username,
      password: hashedPassword,
      full_name: fullName,
      email,
      address: address || null,
      is_admin: false
    });

    console.log('User created:', user.id);

    const token = generateToken(user.id);
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
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      success: false,
      error: 'Registration failed - ' + error.message 
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
