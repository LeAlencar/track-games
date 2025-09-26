"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Trash2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { GameCard } from "@/components/game-card";
import { useAuth } from "@/hooks/use-auth";
import {
  UserGameClientService,
  getStatusDisplayName,
  getStatusColor,
  type UserGameStatus,
} from "@/lib/user-games-client";

// Combined interface for game + user game data
interface LibraryGame {
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
  // User game fields
  userGameId: string;
  status: UserGameStatus;
  priority: string | null;
  platform: string | null;
  personalNotes: string | null;
  hoursPlayed: number | null;
  personalRating: number | null;
  isFavorite: boolean | null;
  isWishlisted: boolean | null;
  isOwned: boolean | null;
  addedAt: Date;
}

interface LibraryStats {
  total: number;
  want_to_play: number;
  playing: number;
  completed: number;
  on_hold: number;
  dropped: number;
}

type SortOption =
  | "name"
  | "rating"
  | "released"
  | "added"
  | "addedAt"
  | "personalRating";
type StatusFilter = UserGameStatus | "all";

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as StatusFilter) || "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("addedAt");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const userId = user?.id;

  // Filter and sort games
  const filteredAndSortedGames = games
    .filter((game) => {
      const matchesSearch =
        game.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
      const matchesStatus =
        statusFilter === "all" || game.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
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
        case "addedAt":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "personalRating":
          return (b.personalRating || 0) - (a.personalRating || 0);
        default:
          return 0;
      }
    });

  const fetchLibrary = async () => {
    // Wait for authentication to complete before proceeding
    if (authLoading) {
      return;
    }

    // Only show auth error after authentication has finished loading
    if (!userId || !isAuthenticated) {
      setError("Você precisa estar logado para ver sua biblioteca");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await UserGameClientService.getUserLibrary(
        userId,
        statusFilter === "all" ? undefined : statusFilter
      );
      setGames(response.library || []);
      setStats(response.stats || null);
    } catch (error) {
      console.error("Failed to fetch library:", error);
      setError("Falha ao carregar biblioteca. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLibraryChange = () => {
    fetchLibrary(); // Refresh the library when games are added/removed/updated
  };

  useEffect(() => {
    fetchLibrary();
  }, [userId, isAuthenticated, statusFilter, authLoading]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="px-6 space-y-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Minha Biblioteca</h1>
            <p className="text-gray-600 mt-1">Carregando...</p>
          </div>
        </div>
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
      </div>
    );
  }

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Minha Biblioteca</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus jogos e acompanhe seu progresso
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 w-full">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar na biblioteca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="want_to_play">Quero Jogar</SelectItem>
                  <SelectItem value="playing">Jogando</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="on_hold">Pausado</SelectItem>
                  <SelectItem value="dropped">Abandonado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={fetchLibrary}
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
              {filteredAndSortedGames.map((game) => (
                <div key={game.userGameId} className="relative">
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge
                      className={`${getStatusColor(game.status)} text-white`}
                    >
                      {getStatusDisplayName(game.status)}
                    </Badge>
                  </div>

                  <GameCard
                    game={
                      {
                        ...game,
                        released: game.released
                          ? new Date(game.released)
                          : null,
                        createdAt: game.createdAt
                          ? new Date(game.createdAt)
                          : null,
                        updatedAt: game.updatedAt
                          ? new Date(game.updatedAt)
                          : null,
                      } as any
                    }
                    showAddToLibrary={true}
                    isInUserLibrary={true}
                    userGameStatus={game.status}
                    onLibraryChange={handleLibraryChange}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && filteredAndSortedGames.length === 0 && !error && (
          <div className="text-center py-12">
            {statusFilter === "all" ? (
              <>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">
                  Sua biblioteca está vazia
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece adicionando alguns jogos à sua biblioteca
                </p>
                <Button onClick={() => (window.location.href = "/games")}>
                  Explorar Jogos
                </Button>
              </>
            ) : (
              <>
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">
                  {searchTerm
                    ? "Nenhum jogo encontrado"
                    : `Nenhum jogo em "${getStatusDisplayName(statusFilter)}"`}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Tente ajustar sua pesquisa"
                    : "Adicione jogos com este status para vê-los aqui"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
