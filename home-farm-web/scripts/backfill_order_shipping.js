require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const before = await client.query(`
      select count(*)::int as count
      from orders
      where shipping_city is null
         or shipping_street is null
         or shipping_postal_code is null
         or shipping_country is null
    `);

    console.log(`Orders needing backfill: ${before.rows[0].count}`);

    const result = await client.query(`
      update orders o
      set shipping_city = u.shipping_city,
          shipping_street = u.shipping_street,
          shipping_postal_code = u.shipping_postal_code,
          shipping_country = u.shipping_country
      from users u
      where o.user_id = u.id
        and (
          o.shipping_city is null
          or o.shipping_street is null
          or o.shipping_postal_code is null
          or o.shipping_country is null
        )
      returning o.id
    `);

    console.log(`Updated orders: ${result.rowCount}`);

    const after = await client.query(`
      select count(*)::int as count
      from orders
      where shipping_city is null
         or shipping_street is null
         or shipping_postal_code is null
         or shipping_country is null
    `);

    console.log(`Orders still needing backfill: ${after.rows[0].count}`);
  } catch (error) {
    console.error('Backfill failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
