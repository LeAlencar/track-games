CREATE TABLE "followers" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "followers_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;