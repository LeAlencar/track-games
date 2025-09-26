#!/usr/bin/env tsx

/**
 * RAWG API Data Fetching Script
 *
 * This script fetches game data from RAWG API and populates the local database.
 *
 * Usage:
 *   npm run fetch-games
 *   npm run fetch-games -- --pages 5 --page-size 40
 *
 * Environment Variables Required:
 *   RAWG_API_KEY - Your RAWG API key from https://rawg.io/apidocs
 *   DATABASE_URL - PostgreSQL connection string
 *   DEBUG_STEAM - Set to "true" to enable Steam extraction debugging
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { games } from "../src/db/schema/games";
import * as dotenv from "dotenv";
import { setTimeout } from "timers/promises";

// Load environment variables
dotenv.config();

// Configuration
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const RAWG_BASE_URL = "https://api.rawg.io/api";

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Default script parameters
const DEFAULT_PAGES = 10;
const DEFAULT_PAGE_SIZE = 20; // RAWG default is 20, max is 40
const DEBUG_STEAM_EXTRACTION = process.env.DEBUG_STEAM === "true";

// Types for RAWG API responses
interface RawgGame {
  id: number;
  slug: string;
  name: string;
  name_original: string;
  description: string;
  released: string | null;
  tba: boolean;
  background_image: string | null;
  background_image_additional: string | null;
  website: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic: number | null;
  playtime: number;
  platforms: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
    };
    released_at: string | null;
    requirements: {
      minimum?: string;
      recommended?: string;
    } | null;
  }>;
  genres: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  developers: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  publishers: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  esrb_rating: {
    id: number;
    slug: string;
    name: string;
  } | null;
  added: number;
  suggestions_count: number;
  reviews_text_count: string;
}

interface RawgGamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

interface RawgScreenshot {
  id: number;
  image: string;
}

interface RawgMovie {
  id: number;
  name: string;
  preview: string;
  data: {
    "480": string;
    max: string;
  };
}

interface RawgGameStore {
  id: number;
  store_id: string;
  url: string;
}

class RawgApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.baseUrl = RAWG_BASE_URL;
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set("key", this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value.toString());
      }
    });

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🌐 Fetching: ${endpoint} (attempt ${attempt})`);

        const response = await fetch(url.toString());

        if (!response.ok) {
          if (response.status === 429) {
            console.log(`⚠️  Rate limited. Waiting ${RETRY_DELAY}ms...`);
            await setTimeout(RETRY_DELAY);
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Rate limiting - wait between successful requests
        await setTimeout(RATE_LIMIT_DELAY);

        return data as T;
      } catch (error) {
        console.error(`❌ Request failed (attempt ${attempt}):`, error);

        if (attempt === MAX_RETRIES) {
          throw error;
        }

        await setTimeout(RETRY_DELAY);
      }
    }

    throw new Error(`Failed to fetch after ${MAX_RETRIES} attempts`);
  }

  async getGames(
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<RawgGamesResponse> {
    return this.makeRequest<RawgGamesResponse>("/games", {
      page,
      page_size: pageSize,
      ordering: "-added", // Most popular games first
      dates: "2000-01-01,2025-12-31", // Reasonable date range
      platforms: "4,5,6,1,2,3,7", // PC, PlayStation, Xbox, Nintendo, etc.
    });
  }

  async getGameDetails(gameId: number): Promise<RawgGame> {
    return this.makeRequest<RawgGame>(`/games/${gameId}`);
  }

  async getGameScreenshots(
    gameId: number
  ): Promise<{ results: RawgScreenshot[] }> {
    return this.makeRequest<{ results: RawgScreenshot[] }>(
      `/games/${gameId}/screenshots`
    );
  }

  async getGameMovies(gameId: number): Promise<{ results: RawgMovie[] }> {
    return this.makeRequest<{ results: RawgMovie[] }>(
      `/games/${gameId}/movies`
    );
  }

  async getGameStores(gameId: number): Promise<{ results: RawgGameStore[] }> {
    return this.makeRequest<{ results: RawgGameStore[] }>(
      `/games/${gameId}/stores`
    );
  }
}

class GameDataTransformer {
  static transformGame(
    rawgGame: RawgGame,
    screenshots: string[] = [],
    trailers: string[] = []
  ): typeof games.$inferInsert {
    return {
      rawgId: rawgGame.id,
      name: rawgGame.name,
      nameOriginal: rawgGame.name_original,
      slug: rawgGame.slug,
      description: rawgGame.description,
      released: rawgGame.released ? new Date(rawgGame.released) : null,
      tba: rawgGame.tba,
      backgroundImage: rawgGame.background_image,
      backgroundImageAdditional: rawgGame.background_image_additional,
      website: rawgGame.website || null,
      rating: rawgGame.rating ? rawgGame.rating.toString() : null,
      ratingTop: rawgGame.rating_top,
      ratingsCount: rawgGame.ratings_count,
      metacriticScore: rawgGame.metacritic,
      playtime: rawgGame.playtime,
      platforms: rawgGame.platforms || [],
      genres: rawgGame.genres || [],
      tags: rawgGame.tags || [],
      developers: rawgGame.developers || [],
      publishers: rawgGame.publishers || [],
      esrbRating: rawgGame.esrb_rating,
      added: rawgGame.added,
      suggestionsCount: rawgGame.suggestions_count,
      reviewsTextCount: rawgGame.reviews_text_count,
      screenshots,
      trailers,
      isActive: true,
    };
  }

  static extractSteamData(
    stores: RawgGameStore[],
    debugGame?: string
  ): {
    steamAppId: number | null;
    steamPrice: string | null;
  } {
    // Log stores for debugging
    if (debugGame && stores.length > 0) {
      console.log(
        `🔍 [${debugGame}] Found ${stores.length} stores:`,
        stores.map((s) => ({
          id: s.id,
          store_id: s.store_id,
          url: s.url.substring(0, 50) + "...",
        }))
      );
    }

    // Try multiple approaches to find Steam store
    // 1. Look for Steam by URL pattern first (most reliable)
    let steamStore = stores.find(
      (store) =>
        store.url &&
        (store.url.includes("store.steampowered.com") ||
          store.url.includes("steam"))
    );

    // 2. If not found, try common Steam store IDs
    if (!steamStore) {
      // Try store_id as string and number - Steam is commonly ID 1, 2, or 11
      const commonSteamIds = ["1", "2", "11", 1, 2, 11];
      steamStore = stores.find(
        (store) =>
          commonSteamIds.includes(store.store_id) ||
          commonSteamIds.includes(parseInt(store.store_id.toString(), 10))
      );
    }

    if (steamStore?.url) {
      // Extract Steam app ID from URL like: https://store.steampowered.com/app/12345/game-name/
      const steamMatch = steamStore.url.match(/\/app\/(\d+)/);
      if (steamMatch && steamMatch[1]) {
        const appId = parseInt(steamMatch[1], 10);
        if (debugGame) {
          console.log(
            `✅ [${debugGame}] Found Steam App ID: ${appId} from store_id: ${steamStore.store_id}, URL: ${steamStore.url}`
          );
        }
        return {
          steamAppId: appId,
          steamPrice: null, // Price would need to be fetched separately from Steam API
        };
      } else if (debugGame) {
        console.log(
          `❌ [${debugGame}] Steam store found but couldn't extract app ID from URL: ${steamStore.url}`
        );
      }
    } else if (debugGame && stores.length > 0) {
      console.log(
        `❌ [${debugGame}] No Steam store found among ${stores.length} stores`
      );
    }

    return {
      steamAppId: null,
      steamPrice: null,
    };
  }
}

class GameDataFetcher {
  private apiClient: RawgApiClient;
  private db: ReturnType<typeof drizzle>;

  constructor(apiKey: string, databaseUrl: string) {
    this.apiClient = new RawgApiClient(apiKey);
    this.db = drizzle(databaseUrl, { casing: "snake_case" });
  }

  async fetchAndStoreGames(
    maxPages: number = DEFAULT_PAGES,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<void> {
    console.log(`🚀 Starting RAWG data fetch...`);
    console.log(`📋 Parameters: ${maxPages} pages, ${pageSize} games per page`);
    console.log(`📊 Expected total: ~${maxPages * pageSize} games\n`);

    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    try {
      for (let page = 1; page <= maxPages; page++) {
        console.log(`\n📄 Processing page ${page}/${maxPages}...`);

        try {
          const gamesResponse = await this.apiClient.getGames(page, pageSize);

          console.log(
            `📦 Found ${gamesResponse.results.length} games on page ${page}`
          );

          for (const rawgGame of gamesResponse.results) {
            try {
              await this.processGame(rawgGame);
              totalProcessed++;
              totalInserted++; // This would be more accurate with actual insert/update distinction

              if (totalProcessed % 10 === 0) {
                console.log(`✅ Processed ${totalProcessed} games...`);
              }
            } catch (error) {
              totalErrors++;
              console.error(
                `❌ Error processing game ${rawgGame.name}:`,
                error
              );
            }
          }

          // If we got fewer games than requested, we've reached the end
          if (gamesResponse.results.length < pageSize) {
            console.log(`\n🏁 Reached end of available games at page ${page}`);
            break;
          }
        } catch (error) {
          console.error(`❌ Error fetching page ${page}:`, error);
          totalErrors++;
          continue;
        }
      }
    } catch (error) {
      console.error("💥 Fatal error during data fetch:", error);
      throw error;
    }

    console.log("\n📊 Final Statistics:");
    console.log(`   Total Processed: ${totalProcessed}`);
    console.log(`   Total Inserted: ${totalInserted}`);
    console.log(`   Total Updated: ${totalUpdated}`);
    console.log(`   Total Errors: ${totalErrors}`);
    console.log(`\n✨ Data fetch completed!`);
  }

  private async processGame(rawgGame: RawgGame): Promise<void> {
    try {
      // Check if game already exists
      const existingGame = await this.db
        .select()
        .from(games)
        .where(eq(games.rawgId, rawgGame.id))
        .limit(1);

      // Fetch additional game data
      const [screenshots, movies, stores] = await Promise.all([
        this.apiClient.getGameScreenshots(rawgGame.id).catch((error) => {
          console.warn(
            `⚠️  Failed to fetch screenshots for ${rawgGame.name}: ${error.message}`
          );
          return { results: [] };
        }),
        this.apiClient.getGameMovies(rawgGame.id).catch((error) => {
          console.warn(
            `⚠️  Failed to fetch movies for ${rawgGame.name}: ${error.message}`
          );
          return { results: [] };
        }),
        this.apiClient.getGameStores(rawgGame.id).catch((error) => {
          console.warn(
            `⚠️  Failed to fetch stores for ${rawgGame.name}: ${error.message}`
          );
          return { results: [] };
        }),
      ]);

      const screenshotUrls = screenshots.results.map((s) => s.image);
      const trailerUrls = movies.results.map((m) => m.data?.max || m.preview);
      const steamData = GameDataTransformer.extractSteamData(
        stores.results,
        DEBUG_STEAM_EXTRACTION ? rawgGame.name : undefined
      );

      const gameData = GameDataTransformer.transformGame(
        rawgGame,
        screenshotUrls,
        trailerUrls
      );

      // Add Steam data
      gameData.steamAppId = steamData.steamAppId;
      gameData.steamPrice = steamData.steamPrice;

      if (existingGame.length > 0) {
        // Update existing game
        await this.db
          .update(games)
          .set({
            ...gameData,
            updatedAt: new Date(),
          })
          .where(eq(games.rawgId, rawgGame.id));

        console.log(`🔄 Updated: ${rawgGame.name}`);
      } else {
        // Insert new game
        await this.db.insert(games).values(gameData);
        console.log(`➕ Inserted: ${rawgGame.name}`);
      }
    } catch (error) {
      console.error(`💥 Error processing ${rawgGame.name}:`, error);
      throw error;
    }
  }
}

// CLI functionality
async function main() {
  console.log("🎮 RAWG Games Data Fetcher\n");

  // Validate environment variables
  if (!RAWG_API_KEY) {
    console.error("❌ RAWG_API_KEY environment variable is required");
    console.error("   Get your API key at: https://rawg.io/apidocs");
    process.exit(1);
  }

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  let maxPages = DEFAULT_PAGES;
  let pageSize = DEFAULT_PAGE_SIZE;

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case "--pages":
        maxPages = parseInt(value || "0", 10) || DEFAULT_PAGES;
        break;
      case "--page-size":
        pageSize = Math.min(
          parseInt(value || "0", 10) || DEFAULT_PAGE_SIZE,
          40
        ); // RAWG max is 40
        break;
      case "--help":
        console.log("Usage: npm run fetch-games [options]");
        console.log("Options:");
        console.log(
          "  --pages <number>      Number of pages to fetch (default: 10)"
        );
        console.log(
          "  --page-size <number>  Games per page, max 40 (default: 20)"
        );
        console.log("  --help                Show this help");
        console.log("\nEnvironment Variables:");
        console.log(
          "  DEBUG_STEAM=true      Enable Steam extraction debugging"
        );
        process.exit(0);
    }
  }

  const fetcher = new GameDataFetcher(RAWG_API_KEY!, DATABASE_URL!);

  try {
    await fetcher.fetchAndStoreGames(maxPages, pageSize);
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
