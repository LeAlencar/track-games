"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FollowersClientService } from "@/lib/followers-client";
import {
  ArrowLeft,
  GamepadIcon,
  MessageSquareIcon,
  Calendar,
  Star,
  Clock,
  TrendingUp,
  Library,
  UserPlus,
  UserMinus,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  gamesCount: number;
  reviewsCount: number;
}

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
  game: {
    id: string;
    name: string;
    slug: string;
    backgroundImage?: string;
    released?: string;
    metacritic?: number;
  };
}

interface LibraryStat {
  status: string;
  count: number;
}

interface RecentGame {
  id: string;
  status: string;
  addedAt: string;
  hoursPlayed?: number;
  game: {
    id: string;
    name: string;
    slug: string;
    backgroundImage?: string;
    released?: string;
    metacritic?: number;
  };
}

const statusLabels: { [key: string]: string } = {
  want_to_play: "Quer Jogar",
  playing: "Jogando",
  completed: "Completados",
  dropped: "Abandonados",
  on_hold: "Em Pausa",
};

const statusColors: { [key: string]: string } = {
  want_to_play: "bg-blue-500",
  playing: "bg-green-500",
  completed: "bg-purple-500",
  dropped: "bg-red-500",
  on_hold: "bg-yellow-500",
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [libraryStats, setLibraryStats] = useState<LibraryStat[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const currentUserId = currentUser?.id;
        const response = await fetch(
          `/api/users/${userId}${
            currentUserId ? `?currentUserId=${currentUserId}` : ""
          }`
        );
        const data = await response.json();

        if (data.success) {
          setProfile(data.user);
          setReviews(data.reviews);
          setLibraryStats(data.libraryStats);
          setRecentGames(data.recentGames);
          setFollowersCount(data.followersCount);
          setFollowingCount(data.followingCount);
          setIsFollowing(data.isFollowing);
        } else {
          setError(data.error || "Erro ao carregar perfil do usuário");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Erro ao carregar perfil do usuário");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !profile?.id || followLoading) return;

    setFollowLoading(true);
    try {
      const result = await FollowersClientService.toggleFollow(
        profile.id,
        currentUser.id
      );

      if (result.success) {
        setIsFollowing(result.isFollowing);
        setFollowersCount((prev) => (result.isFollowing ? prev + 1 : prev - 1));
      } else {
        console.error("Failed to toggle follow:", result.error);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
        </div>

        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-semibold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Membro desde{" "}
                      {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="text-sm">
                      <span className="font-semibold">{followersCount}</span>{" "}
                      <span className="text-muted-foreground">seguidores</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{followingCount}</span>{" "}
                      <span className="text-muted-foreground">seguindo</span>
                    </div>
                  </div>
                </div>

                {/* Follow/Unfollow Button */}
                {isAuthenticated && currentUser?.id !== profile.id && (
                  <div>
                    <Button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      variant={isFollowing ? "outline" : "default"}
                      className="flex items-center gap-2"
                    >
                      {followLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      {followLoading
                        ? "Processando..."
                        : isFollowing
                          ? "Deixar de seguir"
                          : "Seguir"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="h-5 w-5" />
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Este usuário ainda não escreveu nenhum review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                          {review.game.backgroundImage ? (
                            <img
                              src={review.game.backgroundImage}
                              alt={review.game.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <GamepadIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">
                              {review.game.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>

                          {review.reviewText && (
                            <p className="text-muted-foreground mb-2">
                              {review.reviewText}
                            </p>
                          )}

                          <div className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GamepadIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm">Jogos na biblioteca</span>
                </div>
                <Badge variant="secondary">{profile.gamesCount}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm">Reviews escritos</span>
                </div>
                <Badge variant="secondary">{profile.reviewsCount}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Library Stats */}
          {libraryStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Biblioteca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {libraryStats.map((stat) => (
                  <div
                    key={stat.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${statusColors[stat.status] || "bg-gray-500"}`}
                      />
                      <span className="text-sm">
                        {statusLabels[stat.status] || stat.status}
                      </span>
                    </div>
                    <Badge variant="secondary">{stat.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Games */}
          {recentGames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Jogos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentGames.slice(0, 4).map((game) => (
                  <div key={game.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      {game.game.backgroundImage ? (
                        <img
                          src={game.game.backgroundImage}
                          alt={game.game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <GamepadIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {game.game.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${statusColors[game.status] || "bg-gray-500"}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {statusLabels[game.status] || game.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
