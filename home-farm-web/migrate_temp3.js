const { Pool } = require('pg');
require('dotenv').config({path:'../.env'});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        await pool.query(`CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');`);
        await pool.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;`);
        await pool.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";`);
        await pool.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";`);
        console.log('Done');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
