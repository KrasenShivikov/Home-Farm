const { Pool } = require('pg');
require('dotenv').config({path:'../.env'});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        await pool.query(`UPDATE users SET role='admin' WHERE email='admin@example.com'`);
        console.log('Done');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();