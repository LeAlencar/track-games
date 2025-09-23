import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { games } from "@/db/schema/games";
import { desc, asc, like, or, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "added";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build a simple query based on conditions
    let result: any;

    if (search) {
      // Query with search filter
      switch (sortBy) {
        case "name":
          // @ts-ignore - Drizzle ORM complex type inference issue
          result = await db
            .select()
            .from(games)
            .where(
              or(
                like(games.name, `%${search}%`),
                like(games.description, `%${search}%`)
              )
            )
            .orderBy(asc(games.name))
            .limit(limit)
            .offset(offset);
          break;
        case "rating":
          result = await db
            .select()
            .from(games)
            .where(
              or(
                like(games.name, `%${search}%`),
                like(games.description, `%${search}%`)
              )
            )
            .orderBy(desc(games.rating))
            .limit(limit)
            .offset(offset);
          break;
        case "released":
          result = await db
            .select()
            .from(games)
            .where(
              or(
                like(games.name, `%${search}%`),
                like(games.description, `%${search}%`)
              )
            )
            .orderBy(desc(games.released))
            .limit(limit)
            .offset(offset);
          break;
        default: // added
          result = await db
            .select()
            .from(games)
            .where(
              or(
                like(games.name, `%${search}%`),
                like(games.description, `%${search}%`)
              )
            )
            .orderBy(desc(games.added))
            .limit(limit)
            .offset(offset);
          break;
      }
    } else {
      // Query without search filter
      switch (sortBy) {
        case "name":
          result = await db
            .select()
            .from(games)
            .orderBy(asc(games.name))
            .limit(limit)
            .offset(offset);
          break;
        case "rating":
          result = await db
            .select()
            .from(games)
            .orderBy(desc(games.rating))
            .limit(limit)
            .offset(offset);
          break;
        case "released":
          result = await db
            .select()
            .from(games)
            .orderBy(desc(games.released))
            .limit(limit)
            .offset(offset);
          break;
        default: // added
          result = await db
            .select()
            .from(games)
            .orderBy(desc(games.added))
            .limit(limit)
            .offset(offset);
          break;
      }
    }

    return NextResponse.json({
      games: result,
      count: result.length,
      hasMore: result.length === limit,
    });
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
