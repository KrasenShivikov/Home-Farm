const { Pool } = require('pg');
require('dotenv').config({path:'../.env'});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const res = await pool.query(`SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC;`);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
