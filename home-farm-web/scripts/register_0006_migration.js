require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const filePath = path.resolve(__dirname, '../drizzle/0006_amusing_magik.sql');
    const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath, 'utf8')).digest('hex');
    const createdAt = 1779442068688;

    const existing = await client.query(
      `select id, hash, created_at from drizzle.__drizzle_migrations where created_at = $1`,
      [createdAt]
    );

    if (existing.rowCount > 0) {
      console.log('0006 already registered:', existing.rows[0]);
      return;
    }

    const result = await client.query(
      `insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2) returning id, hash, created_at`,
      [hash, createdAt]
    );

    console.log('Registered migration:', result.rows[0]);
  } catch (error) {
    console.error('ERROR', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
