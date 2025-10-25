import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { games } from "@/db/schema/games";
import { userGames } from "@/db/schema/user-games";
import { eq, and, notInArray, isNotNull, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch user's library with game details
    const userLibrary = await db
      .select({
        gameId: userGames.gameId,
        isFavorite: userGames.isFavorite,
        status: userGames.status,
        genres: games.genres,
      })
      .from(userGames)
      .innerJoin(games, eq(userGames.gameId, games.id))
      .where(eq(userGames.userId, userId));

    if (userLibrary.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: "No games in library to base recommendations on",
      });
    }

    // Step 2: Extract and weight genres from user's library
    const genreWeights = new Map<string, number>();

    userLibrary.forEach((item) => {
      const genres = item.genres as Array<{
        id: number;
        name: string;
        slug: string;
      }> | null;
      if (!genres || !Array.isArray(genres)) return;

      // Calculate weight multiplier based on user's relationship with the game
      let weight = 1;
      if (item.isFavorite) {
        weight = 2; // Favorites get 2x weight
      } else if (item.status === "completed") {
        weight = 1.5; // Completed games get 1.5x weight
      }

      genres.forEach((genre) => {
        const currentWeight = genreWeights.get(genre.slug) || 0;
        genreWeights.set(genre.slug, currentWeight + weight);
      });
    });

    if (genreWeights.size === 0) {
      return NextResponse.json({
        recommendations: [],
        message: "No genre data available in library games",
      });
    }

    // Step 3: Get user's game IDs to exclude from recommendations
    const userGameIds = userLibrary.map((item) => item.gameId);

    // Step 4: Fetch candidate games that match genres and aren't in user's library
    const candidateGames = await db
      .select()
      .from(games)
      .where(
        and(
          notInArray(games.id, userGameIds),
          isNotNull(games.genres),
          isNotNull(games.rating)
        )
      )
      .orderBy(desc(games.rating))
      .limit(100); // Get top 100 rated games to filter from

    // Step 5: Score each candidate game
    interface ScoredGame {
      game: (typeof candidateGames)[0];
      score: number;
      matchedGenres: string[];
    }

    const scoredGames: ScoredGame[] = candidateGames
      .map((game) => {
        const gameGenres = game.genres as Array<{
          id: number;
          name: string;
          slug: string;
        }> | null;
        if (!gameGenres || !Array.isArray(gameGenres)) {
          return null;
        }

        let genreMatchScore = 0;
        const matchedGenres: string[] = [];

        gameGenres.forEach((genre) => {
          const weight = genreWeights.get(genre.slug);
          if (weight) {
            genreMatchScore += weight;
            matchedGenres.push(genre.name);
          }
        });

        // Skip games with no genre matches
        if (genreMatchScore === 0) {
          return null;
        }

        // Calculate final score: (genre match) * (rating/5) * log(popularity)
        const rating = parseFloat(game.rating?.toString() || "0");
        const added = game.added || 1;
        const popularityFactor = Math.log(added + 1);
        const ratingFactor = rating / 5;

        const finalScore = genreMatchScore * ratingFactor * popularityFactor;

        return {
          game,
          score: finalScore,
          matchedGenres,
        };
      })
      .filter((item): item is ScoredGame => item !== null);

    // Step 6: Sort by score and take top 10
    scoredGames.sort((a, b) => b.score - a.score);
    const topRecommendations = scoredGames.slice(0, 10);

    // Step 7: Format response
    const recommendations = topRecommendations.map((item) => ({
      id: item.game.id,
      rawgId: item.game.rawgId,
      name: item.game.name,
      slug: item.game.slug,
      backgroundImage: item.game.backgroundImage,
      rating: item.game.rating,
      genres: item.game.genres,
      matchedGenres: item.matchedGenres,
      released: item.game.released,
      playtime: item.game.playtime,
      metacriticScore: item.game.metacriticScore,
      score: item.score,
    }));

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      genresAnalyzed: Array.from(genreWeights.keys()),
    });
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
