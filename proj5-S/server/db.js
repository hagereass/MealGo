const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// migration
(async () => {
  try {
    await pool.query(`
      ALTER TABLE coupons
      ADD COLUMN IF NOT EXISTS nft_token_id TEXT,
      ADD COLUMN IF NOT EXISTS nft_contract_address TEXT;
    `);

    console.log('✅ coupons table ensured nft columns');
  } catch (err) {
    console.error('⚠️ Failed to add nft columns:', err.message);
  }
})();

module.exports = { pool };