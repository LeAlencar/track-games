"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardStats } from "@/components/dashboard-stats";
import { RecentActivity } from "@/components/recent-activity";
import { QuickActions } from "@/components/quick-actions";
import { UserGameClientService } from "@/lib/user-games-client";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  total: number;
  playing: number;
  completed: number;
  want_to_play: number;
  dropped: number;
  on_hold: number;
  favorites: number;
  totalHoursPlayed: number;
}

interface RecentActivityItem {
  id: string;
  type: "game_added" | "status_changed" | "review_created";
  gameTitle: string;
  gameImage?: string;
  status?: "want_to_play" | "playing" | "completed" | "dropped" | "on_hold";
  createdAt: Date;
  description: string;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || authLoading) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user library stats
        const { stats: userStats, library } =
          await UserGameClientService.getUserLibrary(user.id);
        console.log("Dashboard - Full library:", library);
        console.log(
          "Dashboard - Library statuses:",
          library?.map((game: any) => ({
            name: game.name,
            status: game.status,
          }))
        );
        setStats(userStats);

        // Fetch currently playing games - try both API filtering and frontend filtering
        const { library: playingGames } =
          await UserGameClientService.getUserLibrary(user.id, "playing");
        console.log("Dashboard - Playing games from API:", playingGames);
        console.log(
          "Dashboard - Playing games count:",
          playingGames?.length || 0
        );

        // Also try filtering from the full library as a fallback
        const frontendFilteredPlaying =
          library?.filter((game: any) => game.status === "playing") || [];
        console.log(
          "Dashboard - Frontend filtered playing games:",
          frontendFilteredPlaying
        );
        console.log(
          "Dashboard - Frontend filtered count:",
          frontendFilteredPlaying.length
        );

        // Use backend filtered if available, otherwise use frontend filtered
        const finalPlayingGames =
          playingGames && playingGames.length > 0
            ? playingGames
            : frontendFilteredPlaying;
        setCurrentlyPlaying(finalPlayingGames);

        // TODO: Fetch recent activities
        // This would come from an activities API endpoint
        const mockActivities = [
          {
            id: "1",
            type: "game_added" as const,
            gameTitle: "Cyberpunk 2077",
            gameImage:
              "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg",
            status: "want_to_play" as const,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
            description: "Adicionou Cyberpunk 2077 à biblioteca",
          },
          {
            id: "2",
            type: "status_changed" as const,
            gameTitle: "The Witcher 3",
            gameImage:
              "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
            status: "completed" as const,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            description: "Completou The Witcher 3: Wild Hunt",
          },
        ];
        setActivities(mockActivities);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Skeleton className="h-full w-full rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Olá, {user?.name || user?.email || "Usuário"}! 
          </h1>
          <p className="text-secondary mt-1">
            Bem-vindo ao seu dashboard de jogos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats ? stats : undefined} loading={loading} />

      {/* Additional sections that can be added later */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Currently Playing Games */}
        <div className="bg-background p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold"> Jogando Atualmente</h2>
            {currentlyPlaying.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = "/library?status=playing")
                }
              >
                Ver Todos
              </Button>
            )}
          </div>

          {currentlyPlaying.length === 0 ? (
            <div className="text-secondary text-center py-8">
              <p>Você não está jogando nenhum jogo no momento</p>
              <p className="text-sm mt-1">
                Adicione jogos com status "Jogando" para vê-los aqui
              </p>
              <Button
                className="mt-4"
                onClick={() => (window.location.href = "/games")}
              >
                Explorar Jogos
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentlyPlaying.slice(0, 3).map((game) => (
                <div
                  key={game.userGameId}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-background bg-secondary transition-colors"
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    {game.backgroundImage ? (
                      <img
                        src={game.backgroundImage}
                        alt={game.name || "Game"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-background flex items-center justify-center">
                        <span className="text-secondary text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary truncate">
                      {game.name || "Unknown Game"}
                    </h3>
                    <p className="text-sm text-secondary">
                      {game.hoursPlayed
                        ? `${game.hoursPlayed}h jogado`
                        : "Sem horas registradas"}
                    </p>
                    {game.platform && (
                      <p className="text-xs text-secondary">{game.platform}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/games/${game.slug}`)
                    }
                  >
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-background p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Recomendações</h2>
          <div className="text-secondary text-center py-8">
            <p>Recomendações personalizadas em breve!</p>
            <p className="text-sm mt-1">Baseadas nos seus jogos favoritos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
