const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    await pool.query('UPDATE plantings SET description = NULL WHERE id = 7');
    const result = await pool.query('SELECT id, description FROM plantings WHERE id = 7');
    console.table(result.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
})();
