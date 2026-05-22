require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const result = await client.query(`
      select o.id, o.shipping_city, o.shipping_street, o.shipping_postal_code, o.shipping_country
      from orders o
      order by o.id asc
      limit 5
    `);

    console.table(result.rows);
  } catch (error) {
    console.error('Verification failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
