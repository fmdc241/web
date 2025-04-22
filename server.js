const app = require('./app');
const http = require('http');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

// Test DB connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function seedAdmin() {
  const adminUsername = 'admin';
  const adminPassword = 'admin';
  const adminEmail = 'admin@delacruzengineering.com';

  // Check if admin exists
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [adminUsername]);
  if (result.rows.length === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      'INSERT INTO users (username, password, full_name, email, address, is_admin) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminUsername, hashedPassword, 'Administrator', adminEmail, 'Admin Headquarters', true]
    );
    console.log('Admin user seeded.');
  }
}

seedAdmin();