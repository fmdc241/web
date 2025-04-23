// config/db.js
const { Pool } = require('pg');

// Debug: Log the first part of the connection string
console.log('DB Connection String:', process.env.DATABASE_URL?.substring(0, 25) + '...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection immediately
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', err));

module.exports = { pool };
