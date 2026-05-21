require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  console.log('DATABASE_URL=', !!process.env.DATABASE_URL);
  try {
    await client.connect();
    const res = await client.query("select column_name from information_schema.columns where table_name='orders' order by ordinal_position");
    console.log(res.rows.map(r => r.column_name).join(','));
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
