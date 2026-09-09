ALTER TABLE "listings" RENAME COLUMN "image_url" TO "image_urls";--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "image_urls" SET DATA TYPE text[] USING ARRAY["image_urls"];
