CREATE TYPE "public"."activity_type" AS ENUM('корен', 'кг');--> statement-breakpoint
ALTER TABLE "plantings" ADD COLUMN "type" "activity_type" DEFAULT 'корен' NOT NULL;--> statement-breakpoint
ALTER TABLE "wastes" ADD COLUMN "type" "activity_type" DEFAULT 'корен' NOT NULL;