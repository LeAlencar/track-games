"use client";

import { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameCard } from "@/components/game-card";
import { useAuth } from "@/hooks/use-auth";
import {
  UserGameClientService,
  type UserGameStatus,
} from "@/lib/user-games-client";

// Game interface for type safety
interface Game {
  id: string;
  rawgId: number;
  name: string | null;
  slug: string;
  description: string | null;
  released: Date | null;
  backgroundImage: string | null;
  rating: string | null;
  ratingTop: number | null;
  ratingsCount: number | null;
  platforms: any[] | null;
  genres: any[] | null;
  developers: any[] | null;
  publishers: any[] | null;
  tags: any[] | null;
  esrbRating: any | null;
  nameOriginal: string | null;
  summary: string | null;
  tba: boolean | null;
  backgroundImageAdditional: string | null;
  screenshots: string[] | null;
  trailers: string[] | null;
  website: string | null;
  metacriticScore: number | null;
  metacriticUrl: string | null;
  playtime: number | null;
  steamAppId: number | null;
  steamPrice: string | null;
  added: number | null;
  suggestionsCount: number | null;
  reviewsTextCount: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

type SortOption = "name" | "rating" | "released" | "added";

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("added");
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLibrary, setUserLibrary] = useState<Map<number, UserGameStatus>>(
    new Map()
  );
  const [libraryLoading, setLibraryLoading] = useState(false);

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Sort games (API handles filtering)
  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case "released":
        return (
          new Date(b.released || 0).getTime() -
          new Date(a.released || 0).getTime()
        );
      case "added":
        return (b.added || 0) - (a.added || 0);
      default:
        return 0;
    }
  });

  const fetchUserLibrary = async () => {
    // Wait for authentication to complete before proceeding
    if (authLoading) return;
    if (!user?.id || !isAuthenticated) return;

    setLibraryLoading(true);
    try {
      const response = await UserGameClientService.getUserLibrary(user.id);
      const library = new Map<number, UserGameStatus>();
      response.library.forEach((userGame: any) => {
        library.set(userGame.rawgId, userGame.status);
      });

      setUserLibrary(library);
    } catch (error) {
      console.error("Failed to fetch user library:", error);
    } finally {
      setLibraryLoading(false);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sortBy,
        limit: "20",
        offset: "0",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/games?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data = await response.json();
      setGames(data.games || []);

      // Fetch user library after games are loaded
      if (isAuthenticated) {
        fetchUserLibrary();
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
      setError("Failed to load games. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLibraryChange = () => {
    // Refresh library status when games are added/removed/updated
    if (isAuthenticated) {
      fetchUserLibrary();
    }
  };

  useEffect(() => {
    fetchGames();
  }, [sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGames();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    // Fetch user library when authentication status changes
    if (isAuthenticated && user?.id) {
      fetchUserLibrary();
    }
  }, [isAuthenticated, user?.id, authLoading]);

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Explorar Jogos</h1>
          <p className="text-gray-600 mt-1">
            Descubra novos jogos para adicionar à sua biblioteca
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="w-full p-1">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar jogos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="w-full md:w-48">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="added">Mais Popular</SelectItem>
                  <SelectItem value="rating">Melhor Avaliado</SelectItem>
                  <SelectItem value="released">Mais Recente</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {loading
              ? "Carregando..."
              : `${sortedGames.length} jogos encontrados`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={fetchGames}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={
                    {
                      ...game,
                      released: game.released ? new Date(game.released) : null,
                      createdAt: game.createdAt
                        ? new Date(game.createdAt)
                        : null,
                      updatedAt: game.updatedAt
                        ? new Date(game.updatedAt)
                        : null,
                    } as any
                  }
                  showAddToLibrary={true}
                  isInUserLibrary={userLibrary.has(game.rawgId)}
                  userGameStatus={userLibrary.get(game.rawgId)}
                  onLibraryChange={handleLibraryChange}
                />
              ))}
            </div>
          </>
        )}

        {!loading && sortedGames.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              Nenhum jogo encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar sua pesquisa ou filtros
            </p>
          </div>
        )}
      </div>

      {/* TODO: Add pagination */}
      {!loading && sortedGames.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline">Carregar Mais Jogos</Button>
        </div>
      )}
    </div>
  );
}
