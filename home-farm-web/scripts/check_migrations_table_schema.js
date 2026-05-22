require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const result = await client.query(`
      select column_name, data_type, is_nullable
      from information_schema.columns
      where table_schema = 'drizzle' and table_name = '__drizzle_migrations'
      order by ordinal_position
    `);
    console.table(result.rows);
  } catch (error) {
    console.error('ERROR', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
