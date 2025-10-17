import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const followers = pgTable(
  "followers",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    // Composite primary key to prevent duplicate follows
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  })
);

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(user, {
    fields: [followers.followerId],
    references: [user.id],
    relationName: "userFollowers",
  }),
  following: one(user, {
    fields: [followers.followingId],
    references: [user.id],
    relationName: "userFollowing",
  }),
}));
