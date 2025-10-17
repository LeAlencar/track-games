import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { user } from "@/db/schema/auth-schema";
import { userGames } from "@/db/schema/user-games";
import { reviews } from "@/db/schema/reviews";
import { games } from "@/db/schema/games";
import { followers } from "@/db/schema/followers";
import { desc, sql, eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get("currentUserId");

    console.log("userId", userId);
    console.log("currentUserId", currentUserId);

    // Fetch user basic info with stats
    const userInfoResult = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        gamesCount: sql<number>`count(distinct ${userGames.id})`.mapWith(
          Number
        ),
        reviewsCount: sql<number>`count(distinct ${reviews.id})`.mapWith(
          Number
        ),
      })
      .from(user)
      .leftJoin(userGames, eq(user.id, userGames.userId))
      .leftJoin(reviews, eq(user.id, reviews.userId))
      .where(eq(user.id, userId))
      .groupBy(user.id, user.name, user.email, user.image, user.createdAt);

    const userInfo = userInfoResult[0];

    if (!userInfo) {
      return NextResponse.json(
        {
          error: "User not found",
          success: false,
        },
        { status: 404 }
      );
    }

    // Get follower counts with defensive programming
    let followersCount = { count: 0 };
    let followingCount = { count: 0 };

    try {
      const followersResult = await db
        .select({
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(followers)
        .where(eq(followers.followingId, userId));
      followersCount = followersResult[0] || { count: 0 };
    } catch (followerError) {
      console.warn("Followers table may not exist yet:", followerError);
      followersCount = { count: 0 };
    }

    try {
      const followingResult = await db
        .select({
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(followers)
        .where(eq(followers.followerId, userId));
      followingCount = followingResult[0] || { count: 0 };
    } catch (followingError) {
      console.warn("Followers table may not exist yet:", followingError);
      followingCount = { count: 0 };
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      try {
        const followCheckResult = await db
          .select()
          .from(followers)
          .where(
            and(
              eq(followers.followerId, currentUserId),
              eq(followers.followingId, userId)
            )
          );
        isFollowing = followCheckResult.length > 0;
      } catch (followCheckError) {
        console.warn("Followers table may not exist yet:", followCheckError);
        isFollowing = false;
      }
    }

    // Fetch user reviews with game info
    const userReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        reviewText: reviews.content, // Changed from reviewText to content
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        game: {
          id: games.id,
          name: games.name,
          slug: games.slug,
          backgroundImage: games.backgroundImage,
          released: games.released,
          metacritic: games.metacriticScore, // Changed from metacritic to metacriticScore
        },
      })
      .from(reviews)
      .innerJoin(games, eq(reviews.gameId, games.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    // Fetch user library with game status counts
    const libraryStats = await db
      .select({
        status: userGames.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(userGames)
      .where(eq(userGames.userId, userId))
      .groupBy(userGames.status);

    // Fetch some recent games added to library
    const recentGames = await db
      .select({
        id: userGames.id,
        status: userGames.status,
        addedAt: userGames.createdAt,
        hoursPlayed: userGames.hoursPlayed,
        game: {
          id: games.id,
          name: games.name,
          slug: games.slug,
          backgroundImage: games.backgroundImage,
          released: games.released,
          metacritic: games.metacriticScore, // Changed from metacritic to metacriticScore
        },
      })
      .from(userGames)
      .innerJoin(games, eq(userGames.gameId, games.id))
      .where(eq(userGames.userId, userId))
      .orderBy(desc(userGames.createdAt))
      .limit(6);

    return NextResponse.json({
      user: userInfo,
      reviews: userReviews,
      libraryStats,
      recentGames,
      followersCount: followersCount?.count || 0,
      followingCount: followingCount?.count || 0,
      isFollowing,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user profile",
        success: false,
      },
      { status: 500 }
    );
  }
}
