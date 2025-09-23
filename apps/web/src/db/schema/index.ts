// Export tables and schemas
export * from "./games";
export * from "./auth-schema";
export * from "./user-games";

// Export reviews but not relations
export { reviews, reviewsRelations } from "./reviews";

// Export centralized relations
export { userRelations, gamesRelations } from "./relations";
