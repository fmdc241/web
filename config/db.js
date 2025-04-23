const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

console.log('Database connection configured for:',
  process.env.DATABASE_URL?.replace(/\/\/([^:]+):([^@]+)/, '//***:***@')
);

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
