import { db } from "@/db/client";
import {
  userGames,
  type UserGame,
  type NewUserGame,
  type UserGameStatus,
  type UserGamePriority,
} from "@/db/schema/user-games";
import { games } from "@/db/schema/games";
import { eq, and, desc } from "drizzle-orm";

export class UserGameService {
  /**
   * Add a game to user's library
   */
  static async addGameToLibrary(
    userId: string,
    gameId: string,
    data?: Partial<NewUserGame>
  ): Promise<UserGame> {
    const newUserGame: NewUserGame = {
      userId,
      gameId,
      status: data?.status || "want_to_play",
      priority: data?.priority || "medium",
      platform: data?.platform,
      personalRating: data?.personalRating,
      personalNotes: data?.personalNotes,
      isFavorite: data?.isFavorite || false,
      isWishlisted: data?.isWishlisted || false,
      isOwned: data?.isOwned ?? true,
      ...data,
    };

    const [userGame] = await db
      .insert(userGames)
      .values(newUserGame)
      .returning();

    if (!userGame) {
      throw new Error("Failed to create user game");
    }

    return userGame;
  }

  /**
   * Remove a game from user's library
   */
  static async removeGameFromLibrary(
    userId: string,
    gameId: string
  ): Promise<void> {
    await db
      .delete(userGames)
      .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId)));
  }

  /**
   * Update user game data
   */
  static async updateUserGame(
    userId: string,
    gameId: string,
    updates: Partial<UserGame>
  ): Promise<UserGame | null> {
    const [updatedUserGame] = await db
      .update(userGames)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId)))
      .returning();

    return updatedUserGame || null;
  }

  /**
   * Get user's game library with game details
   */
  static async getUserLibrary(userId: string, status?: UserGameStatus) {
    let query = db
      .select({
        userGame: userGames,
        game: games,
      })
      .from(userGames)
      .innerJoin(games, eq(userGames.gameId, games.id))
      .where(eq(userGames.userId, userId))
      .orderBy(desc(userGames.updatedAt));

    if (status) {
      return await db
        .select({
          userGame: userGames,
          game: games,
        })
        .from(userGames)
        .innerJoin(games, eq(userGames.gameId, games.id))
        .where(and(eq(userGames.userId, userId), eq(userGames.status, status)))
        .orderBy(desc(userGames.updatedAt));
    }

    return await query;
  }

  /**
   * Get specific user game
   */
  static async getUserGame(
    userId: string,
    gameId: string
  ): Promise<UserGame | null> {
    const [userGame] = await db
      .select()
      .from(userGames)
      .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId)))
      .limit(1);

    return userGame || null;
  }

  /**
   * Check if user has game in library
   */
  static async hasGameInLibrary(
    userId: string,
    gameId: string
  ): Promise<boolean> {
    const userGame = await this.getUserGame(userId, gameId);
    return !!userGame;
  }

  /**
   * Get user library statistics
   */
  static async getUserLibraryStats(userId: string) {
    const library = await this.getUserLibrary(userId);

    const stats = {
      total: library.length,
      playing: 0,
      completed: 0,
      want_to_play: 0,
      dropped: 0,
      on_hold: 0,
      favorites: 0,
      totalHoursPlayed: 0,
    };

    library.forEach(({ userGame }) => {
      switch (userGame.status) {
        case "playing":
          stats.playing++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "want_to_play":
          stats.want_to_play++;
          break;
        case "dropped":
          stats.dropped++;
          break;
        case "on_hold":
          stats.on_hold++;
          break;
      }

      if (userGame.isFavorite) {
        stats.favorites++;
      }

      stats.totalHoursPlayed += userGame.hoursPlayed || 0;
    });

    return stats;
  }

  /**
   * Update game status (common operation)
   */
  static async updateGameStatus(
    userId: string,
    gameId: string,
    status: UserGameStatus
  ): Promise<UserGame | null> {
    const updates: Partial<UserGame> = { status };

    // Set completion date if status is completed
    if (status === "completed") {
      updates.completedAt = new Date();
      updates.progressPercentage = 100;
    }

    // Set started date if status is playing and not already set
    if (status === "playing") {
      const existingGame = await this.getUserGame(userId, gameId);
      if (!existingGame?.startedAt) {
        updates.startedAt = new Date();
      }
      updates.lastPlayedAt = new Date();
    }

    return await this.updateUserGame(userId, gameId, updates);
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(
    userId: string,
    gameId: string
  ): Promise<boolean> {
    const currentGame = await this.getUserGame(userId, gameId);
    if (!currentGame) return false;

    const newFavoriteStatus = !currentGame.isFavorite;
    await this.updateUserGame(userId, gameId, {
      isFavorite: newFavoriteStatus,
    });

    return newFavoriteStatus;
  }

  /**
   * Update hours played
   */
  static async updateHoursPlayed(
    userId: string,
    gameId: string,
    hoursPlayed: number
  ): Promise<UserGame | null> {
    return await this.updateUserGame(userId, gameId, {
      hoursPlayed,
      lastPlayedAt: new Date(),
    });
  }
}

// Helper functions for status display
export const getStatusDisplayName = (status: UserGameStatus): string => {
  const statusMap: Record<UserGameStatus, string> = {
    want_to_play: "Quero Jogar",
    playing: "Jogando",
    completed: "Concluído",
    dropped: "Abandonado",
    on_hold: "Pausado",
  };
  return statusMap[status];
};

export const getStatusColor = (status: UserGameStatus): string => {
  const colorMap: Record<UserGameStatus, string> = {
    want_to_play: "bg-blue-500",
    playing: "bg-green-500",
    completed: "bg-purple-500",
    dropped: "bg-red-500",
    on_hold: "bg-yellow-500",
  };
  return colorMap[status];
};
