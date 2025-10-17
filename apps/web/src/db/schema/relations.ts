import { relations } from "drizzle-orm";
import { user } from "./auth-schema";
import { games } from "./games";
import { reviews } from "./reviews";
import { userGames } from "./user-games";
import { followers } from "./followers";

// Central relations file to avoid conflicts and circular dependencies

// User relations - all user relationships
export const allUserRelations = relations(user, ({ many }) => ({
  reviews: many(reviews),
  userGames: many(userGames),
  // Followers (users that follow this user)
  followers: many(followers, { relationName: "userFollowing" }),
  // Following (users that this user follows)
  following: many(followers, { relationName: "userFollowers" }),
}));

// Games relations - all game relationships
export const allGamesRelations = relations(games, ({ many }) => ({
  reviews: many(reviews),
  userGames: many(userGames),
}));

// Export these to override the individual relation exports
export { allUserRelations as userRelations };
export { allGamesRelations as gamesRelations };
