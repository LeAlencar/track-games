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
  // RAWG API fields
  rawgId: integer("rawg_id").unique().notNull(), // ID from RAWG API
  name: varchar("name", { length: 255 }).notNull(), // Original name from RAWG
  nameOriginal: varchar("name_original", { length: 255 }), // Original name if different
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  summary: text("summary"), // For custom summary if needed

  // Release information
  released: timestamp("released"), // Release date from RAWG
  tba: boolean("tba").default(false), // To be announced

  // Images and media
  backgroundImage: varchar("background_image", { length: 500 }),
  backgroundImageAdditional: varchar("background_image_additional", {
    length: 500,
  }),
  screenshots: jsonb("screenshots").$type<string[]>(),
  trailers: jsonb("trailers").$type<string[]>(),

  // Game classification
  genres: jsonb("genres").$type<{ id: number; name: string; slug: string }[]>(),
  platforms: jsonb("platforms").$type<
    {
      platform: { id: number; name: string; slug: string };
      released_at: string | null;
      requirements: { minimum?: string; recommended?: string } | null;
    }[]
  >(),
  tags: jsonb("tags").$type<{ id: number; name: string; slug: string }[]>(),

  // Development info
  developers:
    jsonb("developers").$type<{ id: number; name: string; slug: string }[]>(),
  publishers:
    jsonb("publishers").$type<{ id: number; name: string; slug: string }[]>(),

  // Ratings and scores
  rating: decimal("rating", { precision: 3, scale: 2 }), // RAWG user rating
  ratingTop: integer("rating_top"), // Maximum rating scale (usually 5)
  ratingsCount: integer("ratings_count"), // Number of user ratings
  metacriticScore: integer("metacritic_score"),
  metacriticUrl: varchar("metacritic_url", { length: 500 }),

  // ESRB Rating
  esrbRating: jsonb("esrb_rating").$type<{
    id: number;
    slug: string;
    name: string;
  } | null>(),

  // Gameplay info
  playtime: integer("playtime"), // Average playtime in hours

  // External links and IDs
  website: varchar("website", { length: 500 }),
  steamAppId: integer("steam_app_id"), // If you can extract from stores
  steamPrice: decimal("steam_price", { precision: 10, scale: 2 }),

  // Additional metadata from RAWG
  added: integer("added"), // Number of users who added this game
  suggestionsCount: integer("suggestions_count"),
  reviewsTextCount: varchar("reviews_text_count", { length: 20 }),

  // Internal management
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
