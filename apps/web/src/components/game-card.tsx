"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Users, Gamepad2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToLibraryButton } from "./add-to-library-button";
import type { games } from "@/db/schema/games";

interface GameCardProps {
  game: typeof games.$inferSelect;
  showAddToLibrary?: boolean;
  isInUserLibrary?: boolean;
  userGameStatus?: string;
  onLibraryChange?: () => void;
  variant?: "default" | "compact" | "detailed";
}

export function GameCard({
  game,
  showAddToLibrary = true,
  isInUserLibrary = false,
  userGameStatus,
  onLibraryChange,
  variant = "default",
}: GameCardProps) {
  const formatReleaseDate = (date: Date | null) => {
    if (!date) return "TBA";
    return new Date(date).getFullYear().toString();
  };

  const formatRating = (rating: string | null, ratingTop: number | null) => {
    if (!rating || !ratingTop) return null;
    return `${parseFloat(rating).toFixed(1)}/${ratingTop}`;
  };

  const getPlatformBadges = (platforms: any[] | null) => {
    if (!platforms || platforms.length === 0) return [];

    // Get unique platform names, limit to 3 for display
    const uniquePlatforms = platforms
      .map((p) => p.platform?.name)
      .filter(Boolean)
      .slice(0, 3);

    return uniquePlatforms;
  };

  const getTopGenres = (genres: any[] | null) => {
    if (!genres || genres.length === 0) return [];
    return genres.slice(0, 2).map((g) => g.name);
  };

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link href={`/games/${game.slug}`}>
          <div className="flex">
            <div className="relative w-16 h-16 flex-shrink-0">
              {game.backgroundImage ? (
                <Image
                  src={game.backgroundImage}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <CardContent className="flex-1 p-3">
              <h3 className="font-semibold text-sm truncate">{game.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {game.rating && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {formatRating(game.rating, game.ratingTop)}
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  {formatReleaseDate(game.released)}
                </span>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <Link href={`#`}>
        <div className="relative aspect-video w-full">
          {game.backgroundImage ? (
            <Image
              src={game.backgroundImage}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Gamepad2 className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Rating overlay */}
          {game.rating && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-orange-400 text-white-400" />
              {formatRating(game.rating, game.ratingTop)}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Release Year */}
          <div>
            <Link href={`/games/${game.slug}`}>
              <h3 className="font-semibold text-lg leading-tight hover:text-orange-600 transition-colors">
                {game.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Calendar className="w-3 h-3" />
              {formatReleaseDate(game.released)}
              {game.ratingsCount && (
                <>
                  <span>•</span>
                  <Users className="w-3 h-3" />
                  {game.ratingsCount.toLocaleString()} reviews
                </>
              )}
            </div>
          </div>

          {/* Platforms */}
          {getPlatformBadges(game.platforms).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {getPlatformBadges(game.platforms).map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          )}

          {/* Genres */}
          {getTopGenres(game.genres).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {getTopGenres(game.genres).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Description preview (for detailed variant) */}
          {variant === "detailed" && game.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {game.description.replace(/<[^>]*>/g, "").substring(0, 120)}...
            </p>
          )}

          {/* Add to Library Button */}
          {showAddToLibrary && (
            <div className="pt-2">
              <AddToLibraryButton
                gameId={game.id}
                gameName={game.name}
                isInLibrary={isInUserLibrary}
                currentStatus={userGameStatus as any}
                onStatusChange={onLibraryChange}
                size="sm"
                variant="outline"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
