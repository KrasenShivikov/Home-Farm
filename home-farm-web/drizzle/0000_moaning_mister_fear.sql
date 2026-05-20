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
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plantings" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"quantity" numeric(12, 3) NOT NULL,
	"crop_id" integer NOT NULL,
	"created_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL
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
	"crop_id" integer NOT NULL,
	"created_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "crop_products" ADD CONSTRAINT "crop_products_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_products" ADD CONSTRAINT "crop_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvestings" ADD CONSTRAINT "harvestings_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprayings" ADD CONSTRAINT "sprayings_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wastes" ADD CONSTRAINT "wastes_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");