import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { user } from "@/db/schema/auth-schema";
import { userGames } from "@/db/schema/user-games";
import { reviews } from "@/db/schema/reviews";
import { desc, sql, count, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch users with additional stats
    const usersWithStats = await db
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
      .groupBy(user.id, user.name, user.email, user.image, user.createdAt)
      .orderBy(desc(user.createdAt));

    return NextResponse.json({
      users: usersWithStats,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        success: false,
      },
      { status: 500 }
    );
  }
}
