require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('🔌 Using DATABASE_URL connection');

pool.connect()
  .then(() => {
    console.log('✅ Connection successful!');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });