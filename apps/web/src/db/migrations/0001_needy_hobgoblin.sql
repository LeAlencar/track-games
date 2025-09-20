ALTER TABLE "games" RENAME COLUMN "title" TO "name";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "cover_image" TO "background_image";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "publisher" TO "publishers";--> statement-breakpoint
ALTER TABLE "games" DROP CONSTRAINT "games_igdb_id_unique";--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "rawg_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "name_original" varchar(255);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "released" timestamp;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "tba" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "background_image_additional" varchar(500);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "developers" jsonb;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "rating" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "rating_top" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "ratings_count" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "metacritic_url" varchar(500);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "esrb_rating" jsonb;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "playtime" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "website" varchar(500);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "added" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "suggestions_count" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "reviews_text_count" varchar(20);--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "igdb_id";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "release_date";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "developer";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN "age_rating";--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_rawg_id_unique" UNIQUE("rawg_id");