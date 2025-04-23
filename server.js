const app = require('./app');
const http = require('http');
const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');
const path = require('path');
const express = require('express');

// Load environment variables early
require('dotenv').config();

const port = process.env.PORT || 5000;

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL not set in environment variables');
  process.exit(1);
}

// Initialize server
const server = http.createServer(app);

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
}

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

async function startServer() {
  // 1. Test database connection first
  if (!await testDatabaseConnection()) {
    console.error('FATAL: Could not connect to database');
    process.exit(1);
  }

  // 2. Initialize database
  if (!await initializeDatabase()) {
    console.error('FATAL: Database initialization failed');
    process.exit(1);
  }

  // 3. Seed admin user
  await seedAdmin();

  // 4. Start server
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

// Start the application
startServer().catch(err => {
  console.error('FATAL: Server startup failed:', err);
  process.exit(1);
});
