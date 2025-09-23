import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  varchar,
  pgEnum,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { games } from "./games";
import { user } from "./auth-schema";

// Enum for game status in user library
export const gameStatusEnum = pgEnum("game_status", [
  "want_to_play",
  "playing",
  "completed",
  "dropped",
  "on_hold",
]);

// Enum for game priority/rating
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const userGames = pgTable(
  "user_games",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    gameId: uuid("game_id")
      .references(() => games.id, { onDelete: "cascade" })
      .notNull(),

    // Game status tracking
    status: gameStatusEnum("status").default("want_to_play").notNull(),
    priority: priorityEnum("priority").default("medium"),

    // Gaming progress
    hoursPlayed: integer("hours_played").default(0),
    progressPercentage: integer("progress_percentage").default(0), // 0-100

    // Personal rating (different from reviews - this is private to user)
    personalRating: integer("personal_rating"), // 1-5 stars
    personalNotes: text("personal_notes"), // Private notes

    // Platform user played on
    platform: varchar("platform", { length: 50 }), // PC, PS5, Xbox, Switch, etc.

    // Dates
    addedAt: timestamp("added_at").defaultNow().notNull(),
    startedAt: timestamp("started_at"), // When they started playing
    completedAt: timestamp("completed_at"), // When they finished
    lastPlayedAt: timestamp("last_played_at"), // Last session

    // Flags
    isFavorite: boolean("is_favorite").default(false),
    isWishlisted: boolean("is_wishlisted").default(false), // For future purchases
    isOwned: boolean("is_owned").default(true), // Do they own the game

    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Ensure user can only have one entry per game
    uniqueUserGame: unique().on(table.userId, table.gameId),
  })
);

// Relations
export const userGamesRelations = relations(userGames, ({ one }) => ({
  user: one(user, {
    fields: [userGames.userId],
    references: [user.id],
  }),
  game: one(games, {
    fields: [userGames.gameId],
    references: [games.id],
  }),
}));

// Helper types
export type UserGameStatus = (typeof userGames.status.enumValues)[number];
export type UserGamePriority = (typeof userGames.priority.enumValues)[number];
export type UserGame = typeof userGames.$inferSelect;
export type NewUserGame = typeof userGames.$inferInsert;
