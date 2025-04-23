const app = require('./app');
const http = require('http');
const { pool } = require('./config/db'); // Remove the separate Pool creation
const bcrypt = require('bcryptjs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const port = process.env.PORT || 5000; // Render automatically sets PORT

server.listen(port, '0.0.0.0', () => { // Explicitly listen on all interfaces
  console.log(`Server running on port ${port}`);
});
const server = http.createServer(app);

// REMOVE THIS DUPLICATE POOL CREATION:
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

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

// ... rest of your code remains exactly the same ...
