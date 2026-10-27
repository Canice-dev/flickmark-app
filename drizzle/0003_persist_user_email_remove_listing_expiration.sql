UPDATE "listings" SET "status" = 'active' WHERE "status" = 'expired';--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DEFAULT 'active'::text;--> statement-breakpoint
DROP TYPE "public"."listing_status";--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('active', 'paused', 'sold', 'deleted');--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."listing_status";--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DATA TYPE "public"."listing_status" USING "status"::"public"."listing_status";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(320);--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "expires_at";
