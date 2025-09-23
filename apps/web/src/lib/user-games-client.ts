// Client-side service for user games that calls API routes instead of database directly
// Types defined locally to avoid server-side imports
export type UserGameStatus =
  | "want_to_play"
  | "playing"
  | "completed"
  | "dropped"
  | "on_hold";
export type UserGamePriority = "low" | "medium" | "high";

interface AddGameToLibraryData {
  status?: UserGameStatus;
  priority?: UserGamePriority;
  platform?: string | null;
  personalNotes?: string | null;
  hoursPlayed?: number;
  personalRating?: number;
  isFavorite?: boolean;
  isWishlisted?: boolean;
  isOwned?: boolean;
}

export class UserGameClientService {
  /**
   * Add a game to user's library
   */
  static async addGameToLibrary(
    userId: string,
    gameId: string,
    data?: AddGameToLibraryData
  ) {
    const response = await fetch("/api/user-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        gameId,
        action: "add",
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add game to library");
    }

    return await response.json();
  }

  /**
   * Remove a game from user's library
   */
  static async removeGameFromLibrary(userId: string, gameId: string) {
    const response = await fetch("/api/user-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        gameId,
        action: "remove",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove game from library");
    }

    return await response.json();
  }

  /**
   * Update user game data
   */
  static async updateUserGame(
    userId: string,
    gameId: string,
    updates: Partial<AddGameToLibraryData>
  ) {
    const response = await fetch("/api/user-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        gameId,
        action: "update",
        ...updates,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update game");
    }

    return await response.json();
  }

  /**
   * Get specific user game
   */
  static async getUserGame(userId: string, gameId: string) {
    const params = new URLSearchParams({ userId, gameId });
    const response = await fetch(`/api/user-games?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get user game");
    }

    return await response.json();
  }

  /**
   * Check if user has game in library
   */
  static async hasGameInLibrary(
    userId: string,
    gameId: string
  ): Promise<boolean> {
    try {
      const { userGame } = await this.getUserGame(userId, gameId);
      return !!userGame;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's game library
   */
  static async getUserLibrary(userId: string, status?: UserGameStatus) {
    const params = new URLSearchParams({ userId });
    if (status) {
      params.append("status", status);
    }

    const response = await fetch(`/api/user-games?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get user library");
    }

    return await response.json();
  }

  /**
   * Update game status (common operation)
   */
  static async updateGameStatus(
    userId: string,
    gameId: string,
    status: UserGameStatus
  ) {
    const response = await fetch("/api/user-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        gameId,
        action: "updateStatus",
        status,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update game status");
    }

    return await response.json();
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(userId: string, gameId: string) {
    const response = await fetch("/api/user-games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        gameId,
        action: "toggleFavorite",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to toggle favorite");
    }

    return await response.json();
  }
}

// Helper functions for status display (moved from server-side)
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
