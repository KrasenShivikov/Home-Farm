require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const fs = require('fs');
(async () => {
  const sql = fs.readFileSync(require('path').resolve(__dirname, '../drizzle/0004_orders_shipping_columns.sql'), 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Executing SQL:\n', sql);
    await client.query(sql);
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
