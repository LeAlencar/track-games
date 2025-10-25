import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { games } from "@/db/schema/games";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Fetch game by slug
    const game = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (!game || game.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({
      game: game[0],
    });
  } catch (error) {
    console.error("Failed to fetch game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
