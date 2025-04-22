const app = require('./app');
const http = require('http');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://website_db_h6qu_user:o9Fjbjp3MEU4w4nGTwgQOsFXQxybzcBJ@dpg-d03r8obuibrs73aih370-a/website_db_h6qu',
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  },
  searchPath: ['public']
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
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
  } catch (err) {
    console.error('Could not initialize database:', err);
  }
}

// Modify your startup sequence:
pool.query('SELECT NOW()', async (err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
    await initializeDatabase();  // Add this line
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
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
  try {
    // First, verify table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('Users table does not exist!');
      return;
    }

    const adminUsername = 'admin';
    const adminPassword = 'admin';
    const adminEmail = 'admin@delacruzengineering.com';

    // Check if admin exists - using explicit case handling
    const result = await pool.query(`
      SELECT * FROM "users" WHERE username = $1
    `, [adminUsername]);

    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(`
        INSERT INTO "users" 
        (username, password, full_name, email, address, is_admin) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [adminUsername, hashedPassword, 'Administrator', adminEmail, 'Admin Headquarters', true]);
      console.log('Admin user seeded.');
    }
  } catch (err) {
    console.error('Error in seedAdmin:', err);
  }
}

seedAdmin();