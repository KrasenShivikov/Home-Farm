require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const fs = require('fs');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const sql = fs.readFileSync(require('path').resolve(__dirname, '../drizzle/0006_amusing_magik.sql'), 'utf8');
    console.log(sql);
    await client.query(sql);
    console.log('applied');
  } catch (error) {
    console.error('ERROR', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
