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
import { games } from "./games";
import { user } from "./auth-schema";

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
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
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
  game: one(games, {
    fields: [reviews.gameId],
    references: [games.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  reviews: many(reviews),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  reviews: many(reviews),
}));
