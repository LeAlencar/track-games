CREATE TYPE "public"."game_status" AS ENUM('want_to_play', 'playing', 'completed', 'dropped', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "user_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"game_id" uuid NOT NULL,
	"status" "game_status" DEFAULT 'want_to_play' NOT NULL,
	"priority" "priority" DEFAULT 'medium',
	"hours_played" integer DEFAULT 0,
	"progress_percentage" integer DEFAULT 0,
	"personal_rating" integer,
	"personal_notes" text,
	"platform" varchar(50),
	"added_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_played_at" timestamp,
	"is_favorite" boolean DEFAULT false,
	"is_wishlisted" boolean DEFAULT false,
	"is_owned" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_games_user_id_game_id_unique" UNIQUE("user_id","game_id")
);
--> statement-breakpoint
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_games" ADD CONSTRAINT "user_games_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;