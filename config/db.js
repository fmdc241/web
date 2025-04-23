const { Pool } = require('pg');
require('dotenv').config();

const poolInstance = new Pool({  // Changed variable name
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

module.exports = {
  query: (text, params) => poolInstance.query(text, params),
  pool: poolInstance  // Export as 'pool' for backward compatibility
};
