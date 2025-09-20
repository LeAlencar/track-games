import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  igdbId: integer("igdb_id").unique(), // ID da IGDB API
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  summary: text("summary"),
  releaseDate: timestamp("release_date"),
  coverImage: varchar("cover_image", { length: 500 }),
  screenshots: jsonb("screenshots").$type<string[]>(),
  trailers: jsonb("trailers").$type<string[]>(),
  genres: jsonb("genres").$type<string[]>(),
  platforms: jsonb("platforms").$type<string[]>(),
  developer: varchar("developer", { length: 255 }),
  publisher: varchar("publisher", { length: 255 }),
  ageRating: varchar("age_rating", { length: 10 }),
  metacriticScore: integer("metacritic_score"),
  steamAppId: integer("steam_app_id"),
  steamPrice: decimal("steam_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
