require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const typeResult = await client.query(`
      select exists (
        select 1
        from pg_type t
        join pg_namespace n on n.oid = t.typnamespace
        where n.nspname = 'public' and t.typname = 'activity_type'
      ) as exists
    `);
    const columnResult = await client.query(`
      select table_name, column_name
      from information_schema.columns
      where table_name in ('plantings', 'wastes') and column_name = 'type'
      order by table_name
    `);
    console.log('activity_type exists:', typeResult.rows[0].exists);
    console.table(columnResult.rows);
  } catch (error) {
    console.error('ERROR', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
