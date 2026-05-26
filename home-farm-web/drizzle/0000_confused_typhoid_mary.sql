CREATE TYPE "public"."activity_type" AS ENUM('корен', 'кг');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "crop_products" (
	"crop_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	CONSTRAINT "crop_products_crop_id_product_id_pk" PRIMARY KEY("crop_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"variety" text,
	"for_sale" boolean DEFAULT false NOT NULL,
	"price" numeric(10, 2),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "expences" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"expences_type_id" integer NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"value" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "expences_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "harvestings" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"crop_id" integer NOT NULL,
	"created_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "order_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"crop_id" integer NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"shipping_city" text,
	"shipping_street" text,
	"shipping_postal_code" text,
	"shipping_country" text
);
--> statement-breakpoint
CREATE TABLE "plantings" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"type" "activity_type" DEFAULT 'корен' NOT NULL,
	"crop_id" integer NOT NULL,
	"created_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"quantity" numeric(12, 3) DEFAULT '1.000' NOT NULL,
	"price" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "sprayings" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"crop_id" integer NOT NULL,
	"created_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"shipping_city" text NOT NULL,
	"shipping_street" text NOT NULL,
	"shipping_postal_code" text,
	"shipping_country" text
);
--> statement-breakpoint
CREATE TABLE "wastes" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"type" "activity_type" DEFAULT 'корен' NOT NULL,
	"crop_id" integer NOT NULL,
	"created_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "crop_products" ADD CONSTRAINT "crop_products_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_products" ADD CONSTRAINT "crop_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expences" ADD CONSTRAINT "expences_expences_type_id_expences_type_id_fk" FOREIGN KEY ("expences_type_id") REFERENCES "public"."expences_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvestings" ADD CONSTRAINT "harvestings_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprayings" ADD CONSTRAINT "sprayings_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wastes" ADD CONSTRAINT "wastes_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crop_products_product_idx" ON "crop_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "crops_for_sale_name_idx" ON "crops" USING btree ("for_sale","name");--> statement-breakpoint
CREATE INDEX "expences_date_idx" ON "expences" USING btree ("date");--> statement-breakpoint
CREATE INDEX "expences_type_date_idx" ON "expences" USING btree ("expences_type_id","date");--> statement-breakpoint
CREATE INDEX "harvestings_crop_date_idx" ON "harvestings" USING btree ("crop_id","date");--> statement-breakpoint
CREATE INDEX "harvestings_date_idx" ON "harvestings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "order_lines_order_crop_idx" ON "order_lines" USING btree ("order_id","crop_id");--> statement-breakpoint
CREATE INDEX "order_lines_crop_idx" ON "order_lines" USING btree ("crop_id");--> statement-breakpoint
CREATE INDEX "orders_user_status_id_idx" ON "orders" USING btree ("user_id","status","id");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "plantings_crop_date_idx" ON "plantings" USING btree ("crop_id","date");--> statement-breakpoint
CREATE INDEX "plantings_date_idx" ON "plantings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "products_date_idx" ON "products" USING btree ("date");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sprayings_crop_date_idx" ON "sprayings" USING btree ("crop_id","date");--> statement-breakpoint
CREATE INDEX "sprayings_date_idx" ON "sprayings" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "wastes_crop_date_idx" ON "wastes" USING btree ("crop_id","date");--> statement-breakpoint
CREATE INDEX "wastes_date_idx" ON "wastes" USING btree ("date");--> statement-breakpoint
CREATE INDEX "wastes_type_idx" ON "wastes" USING btree ("type");