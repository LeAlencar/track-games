import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { games } from "./games";

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  gameId: uuid("game_id")
    .references(() => games.id, { onDelete: "cascade" })
    .notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // PC, PS5, Xbox, Switch
  rating: integer("rating").notNull(), // 1-5 estrelas
  title: varchar("title", { length: 255 }),
  content: text("content"),
  hoursPlayed: integer("hours_played"),
  isRecommended: boolean("is_recommended"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  likesCount: integer("likes_count").default(0),
  dislikesCount: integer("dislikes_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [reviews.gameId],
    references: [games.id],
  }),
}));
