CREATE TABLE "expences" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"expences_type_id" integer NOT NULL,
	"description" text,
	"date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expences_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expences" ADD CONSTRAINT "expences_expences_type_id_expences_type_id_fk" FOREIGN KEY ("expences_type_id") REFERENCES "public"."expences_type"("id") ON DELETE restrict ON UPDATE no action;