import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  avatar: varchar("avatar", { length: 500 }),
  steamId: varchar("steam_id", { length: 50 }),
  epicId: varchar("epic_id", { length: 50 }),
  psnId: varchar("psn_id", { length: 50 }),
  xboxId: varchar("xbox_id", { length: 50 }),
  isVerified: boolean("is_verified").default(false),
  reputation: integer("reputation").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
