import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { followers } from "@/db/schema/followers";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followingId } = await params;
    const { followerId } = await request.json();

    if (!followerId) {
      return NextResponse.json(
        { error: "Follower ID is required", success: false },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { error: "Cannot follow yourself", success: false },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await db
      .select()
      .from(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );

    if (existingFollow.length > 0) {
      return NextResponse.json(
        { error: "Already following this user", success: false },
        { status: 409 }
      );
    }

    // Create follow relationship
    await db.insert(followers).values({
      followerId,
      followingId,
    });

    return NextResponse.json({
      message: "User followed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followingId } = await params;
    const url = new URL(request.url);
    const followerId = url.searchParams.get("followerId");

    if (!followerId) {
      return NextResponse.json(
        { error: "Follower ID is required", success: false },
        { status: 400 }
      );
    }

    // Remove follow relationship
    const result = await db
      .delete(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );

    return NextResponse.json({
      message: "User unfollowed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user", success: false },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user is following another user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followingId } = await params;
    const url = new URL(request.url);
    const followerId = url.searchParams.get("followerId");

    if (!followerId) {
      return NextResponse.json(
        { error: "Follower ID is required", success: false },
        { status: 400 }
      );
    }

    // Check if following
    const isFollowing = await db
      .select()
      .from(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, followingId)
        )
      );

    return NextResponse.json({
      isFollowing: isFollowing.length > 0,
      success: true,
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status", success: false },
      { status: 500 }
    );
  }
}
