import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { user } from "@/db/schema/auth-schema";
import { followers } from "@/db/schema/followers";
import { userGames } from "@/db/schema/user-games";
import { reviews } from "@/db/schema/reviews";
import { desc, sql, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get("userId");

    if (!currentUserId) {
      return NextResponse.json(
        { error: "User ID is required", success: false },
        { status: 400 }
      );
    }

    // Fetch users that the current user is following with their stats
    const followingUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        followedAt: followers.createdAt,
        gamesCount: sql<number>`count(distinct ${userGames.id})`.mapWith(
          Number
        ),
        reviewsCount: sql<number>`count(distinct ${reviews.id})`.mapWith(
          Number
        ),
      })
      .from(followers)
      .innerJoin(user, eq(followers.followingId, user.id))
      .leftJoin(userGames, eq(user.id, userGames.userId))
      .leftJoin(reviews, eq(user.id, reviews.userId))
      .where(eq(followers.followerId, currentUserId))
      .groupBy(
        user.id,
        user.name,
        user.email,
        user.image,
        user.createdAt,
        followers.createdAt
      )
      .orderBy(desc(followers.createdAt));

    // Get total count of users being followed
    const totalFollowingResult = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(followers)
      .where(eq(followers.followerId, currentUserId));

    const totalFollowing = totalFollowingResult[0]?.count || 0;

    return NextResponse.json({
      followingUsers,
      totalFollowing,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching following users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch following users",
        success: false,
      },
      { status: 500 }
    );
  }
}
