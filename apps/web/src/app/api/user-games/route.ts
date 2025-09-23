import { NextRequest, NextResponse } from "next/server";
import { UserGameService } from "@/lib/user-games";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, gameId, action, ...data } = body;

    if (!userId || !gameId) {
      return NextResponse.json(
        { error: "userId and gameId are required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "add":
        const userGame = await UserGameService.addGameToLibrary(
          userId,
          gameId,
          data
        );
        return NextResponse.json({ userGame });

      case "update":
        const updatedGame = await UserGameService.updateUserGame(
          userId,
          gameId,
          data
        );
        return NextResponse.json({ userGame: updatedGame });

      case "remove":
        await UserGameService.removeGameFromLibrary(userId, gameId);
        return NextResponse.json({ success: true });

      case "updateStatus":
        const statusUpdated = await UserGameService.updateGameStatus(
          userId,
          gameId,
          data.status
        );
        return NextResponse.json({ userGame: statusUpdated });

      case "toggleFavorite":
        const newFavoriteStatus = await UserGameService.toggleFavorite(
          userId,
          gameId
        );
        return NextResponse.json({ isFavorite: newFavoriteStatus });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("User games API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const gameId = searchParams.get("gameId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (gameId) {
      // Get specific user game
      const userGame = await UserGameService.getUserGame(userId, gameId);
      return NextResponse.json({ userGame });
    } else if (status) {
      // Get user library with status filter
      const rawLibrary = await UserGameService.getUserLibrary(
        userId,
        status as any
      );
      const library = rawLibrary.map(({ userGame, game }) => ({
        ...game,
        // User game fields
        userGameId: userGame.id,
        status: userGame.status,
        priority: userGame.priority,
        platform: userGame.platform,
        personalNotes: userGame.personalNotes,
        hoursPlayed: userGame.hoursPlayed,
        personalRating: userGame.personalRating,
        isFavorite: userGame.isFavorite,
        isWishlisted: userGame.isWishlisted,
        isOwned: userGame.isOwned,
        addedAt: userGame.createdAt,
      }));
      return NextResponse.json({ library });
    } else {
      // Get full user library
      const rawLibrary = await UserGameService.getUserLibrary(userId);
      const stats = await UserGameService.getUserLibraryStats(userId);
      const library = rawLibrary.map(({ userGame, game }) => ({
        ...game,
        // User game fields
        userGameId: userGame.id,
        status: userGame.status,
        priority: userGame.priority,
        platform: userGame.platform,
        personalNotes: userGame.personalNotes,
        hoursPlayed: userGame.hoursPlayed,
        personalRating: userGame.personalRating,
        isFavorite: userGame.isFavorite,
        isWishlisted: userGame.isWishlisted,
        isOwned: userGame.isOwned,
        addedAt: userGame.createdAt,
      }));
      return NextResponse.json({ library, stats });
    }
  } catch (error) {
    console.error("User games API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
