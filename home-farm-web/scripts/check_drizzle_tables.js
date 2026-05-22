require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const result = await client.query(`
      select table_schema, table_name
      from information_schema.tables
      where table_name ilike '%drizzle%'
      order by table_schema, table_name
    `);
    console.table(result.rows);
  } catch (error) {
    console.error('ERROR', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
