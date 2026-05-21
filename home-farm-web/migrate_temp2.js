const { Pool } = require('pg');
require('dotenv').config({path:'../.env'});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
  CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');
  ALTER TABLE "users" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";
`;

pool.query(sql)
  .then(()=>console.log('Done'))
  .catch(console.error)
  .finally(()=>pool.end());
