import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { reviews } from "@/db/schema/reviews";
import { games } from "@/db/schema/games";
import { user } from "@/db/schema/auth-schema";
import { eq, desc, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      gameId,
      platform,
      rating,
      title,
      content,
      hoursPlayed,
      isRecommended,
      isVerifiedPurchase,
    } = body;

    // Validate required fields
    if (!userId || !gameId || !platform || !rating) {
      return NextResponse.json(
        { error: "userId, gameId, platform, and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user already has a review for this game
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.gameId, gameId)))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: "You already have a review for this game" },
        { status: 400 }
      );
    }

    // Create the review
    const newReview = await db
      .insert(reviews)
      .values({
        userId,
        gameId,
        platform,
        rating,
        title: title || null,
        content: content || null,
        hoursPlayed: hoursPlayed || null,
        isRecommended: isRecommended || null,
        isVerifiedPurchase: isVerifiedPurchase || false,
      })
      .returning();

    return NextResponse.json({ review: newReview[0] });
  } catch (error) {
    console.error("Reviews API POST error:", error);
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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (userId && gameId) {
      // Get specific user's review for a game
      const userReview = await db
        .select({
          review: reviews,
          game: games,
        })
        .from(reviews)
        .leftJoin(games, eq(reviews.gameId, games.id))
        .where(and(eq(reviews.userId, userId), eq(reviews.gameId, gameId)))
        .limit(1);

      return NextResponse.json({ review: userReview[0] || null });
    } else if (userId) {
      // Get all reviews by a specific user
      const userReviews = await db
        .select({
          review: reviews,
          game: games,
        })
        .from(reviews)
        .leftJoin(games, eq(reviews.gameId, games.id))
        .where(eq(reviews.userId, userId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);

      const formattedReviews = userReviews.map(({ review, game }) => ({
        ...review,
        game,
      }));

      return NextResponse.json({
        reviews: formattedReviews,
        count: formattedReviews.length,
        hasMore: formattedReviews.length === limit,
      });
    } else if (gameId) {
      // Get all reviews for a specific game
      const gameReviews = await db
        .select({
          review: reviews,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(reviews)
        .leftJoin(user, eq(reviews.userId, user.id))
        .where(eq(reviews.gameId, gameId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);

      const formattedReviews = gameReviews.map(({ review, user }) => ({
        ...review,
        user,
      }));

      return NextResponse.json({
        reviews: formattedReviews,
        count: formattedReviews.length,
        hasMore: formattedReviews.length === limit,
      });
    } else {
      // Get all reviews (public feed)
      const allReviews = await db
        .select({
          review: reviews,
          game: games,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(reviews)
        .leftJoin(games, eq(reviews.gameId, games.id))
        .leftJoin(user, eq(reviews.userId, user.id))
        .where(eq(reviews.isActive, true))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);

      const formattedReviews = allReviews.map(({ review, game, user }) => ({
        ...review,
        game,
        user,
      }));

      return NextResponse.json({
        reviews: formattedReviews,
        count: formattedReviews.length,
        hasMore: formattedReviews.length === limit,
      });
    }
  } catch (error) {
    console.error("Reviews API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reviewId,
      userId,
      platform,
      rating,
      title,
      content,
      hoursPlayed,
      isRecommended,
    } = body;

    // Validate required fields
    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: "reviewId and userId are required" },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if the review exists and belongs to the user
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: "Review not found or access denied" },
        { status: 404 }
      );
    }

    // Update the review
    const updatedReview = await db
      .update(reviews)
      .set({
        platform: platform || existingReview[0].platform,
        rating: rating || existingReview[0].rating,
        title: title !== undefined ? title : existingReview[0].title,
        content: content !== undefined ? content : existingReview[0].content,
        hoursPlayed:
          hoursPlayed !== undefined
            ? hoursPlayed
            : existingReview[0].hoursPlayed,
        isRecommended:
          isRecommended !== undefined
            ? isRecommended
            : existingReview[0].isRecommended,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return NextResponse.json({ review: updatedReview[0] });
  } catch (error) {
    console.error("Reviews API PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get("reviewId");
    const userId = searchParams.get("userId");

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: "reviewId and userId are required" },
        { status: 400 }
      );
    }

    // Check if the review exists and belongs to the user
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: "Review not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the review
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reviews API DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
