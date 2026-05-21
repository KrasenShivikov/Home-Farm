ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_city" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_street" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_postal_code" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_country" text;
