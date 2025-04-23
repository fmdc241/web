const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const jwt = require('jsonwebtoken'); // Install with: npm install jsonwebtoken

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // 2. Find user
    const userQuery = await pool.query(
      'SELECT id, username, password, is_admin FROM users WHERE username = $1',
      [username]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userQuery.rows[0];

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Create JWT token
    const token = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // 5. Respond with token (omit password)
    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin,
      token
    });

  } catch (err) {
    console.error('Login error:', {
      endpoint: '/api/auth/login',
      error: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Login failed',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message })
    });
  }
});

module.exports = router;