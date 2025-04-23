const app = require('./app');
const http = require('http');
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        address TEXT,
        is_admin BOOLEAN DEFAULT false
      )
    `);
    console.log('Verified users table exists');
    return true;
  } catch (err) {
    console.error('Database initialization failed:', err);
    return false;
  }
}

async function seedAdmin() {
  try {
    const adminUsername = 'admin';
    const adminPassword = 'admin';
    const adminEmail = 'admin@delacruzengineering.com';

    const result = await pool.query(
      'SELECT * FROM public.users WHERE username = $1', 
      [adminUsername]
    );
    
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO public.users 
        (username, password, full_name, email, address, is_admin) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminUsername, hashedPassword, 'Administrator', adminEmail, 'Admin Headquarters', true]
      );
      console.log('Admin user seeded.');
    }
  } catch (err) {
    console.error('Admin seeding failed:', err);
  }
}

async function startServer() {
  try {
    // 1. Test database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected');
    
    // 2. Initialize database
    if (!await initializeDatabase()) {
      throw new Error('Database initialization failed');
    }
    
    // 3. Seed admin user
    await seedAdmin();
    
    // 4. Start server
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the application
startServer();
