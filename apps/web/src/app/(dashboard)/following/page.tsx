"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FollowersClientService } from "@/lib/followers-client";
import {
  UserCheck,
  GamepadIcon,
  MessageSquareIcon,
  Calendar,
  Users,
  UserMinus,
  Heart,
} from "lucide-react";

interface FollowingUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  followedAt: string;
  gamesCount: number;
  reviewsCount: number;
}

export default function FollowingPage() {
  const router = useRouter();
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unfollowingUsers, setUnfollowingUsers] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id || authLoading) {
      setLoading(false);
      return;
    }

    const fetchFollowingUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/following?userId=${currentUser.id}`);
        const data = await response.json();

        if (data.success) {
          setFollowingUsers(data.followingUsers);
          setTotalFollowing(data.totalFollowing);
        } else {
          setError(data.error || "Erro ao carregar usuários seguidos");
        }
      } catch (err) {
        console.error("Error fetching following users:", err);
        setError("Erro ao carregar usuários seguidos");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [currentUser?.id, isAuthenticated, authLoading]);

  const handleUnfollow = async (userId: string) => {
    if (!currentUser?.id || unfollowingUsers.has(userId)) return;

    setUnfollowingUsers((prev) => new Set(prev).add(userId));

    try {
      const result = await FollowersClientService.unfollowUser(
        userId,
        currentUser.id
      );

      if (result.success) {
        // Remove user from the list
        setFollowingUsers((prev) => prev.filter((user) => user.id !== userId));
        setTotalFollowing((prev) => prev - 1);
      } else {
        console.error("Failed to unfollow user:", result.error);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setUnfollowingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Login necessário</h3>
          <p className="text-muted-foreground mb-4">
            Você precisa estar logado para ver os usuários que está seguindo.
          </p>
          <Button onClick={() => router.push("/login")}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <UserCheck className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Seguindo</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <UserCheck className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Seguindo</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <UserCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Seguindo</h1>
        <Badge variant="secondary" className="ml-auto">
          {totalFollowing} {totalFollowing === 1 ? "usuário" : "usuários"}
        </Badge>
      </div>

      <p className="text-muted-foreground mb-6">
        Usuários que você está seguindo na comunidade Ludexicon
      </p>

      {/* Following Users Grid */}
      {followingUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Você ainda não segue ninguém
          </h3>
          <p className="text-muted-foreground mb-4">
            Descubra outros jogadores e comece a seguir suas atividades!
          </p>
          <Button onClick={() => router.push("/players")}>
            <Users className="h-4 w-4 mr-2" />
            Descobrir Jogadores
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {followingUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GamepadIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm">Jogos na biblioteca</span>
                    </div>
                    <Badge variant="secondary">{user.gamesCount}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquareIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm">Reviews escritos</span>
                    </div>
                    <Badge variant="secondary">{user.reviewsCount}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="text-sm">Seguindo desde</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.followedAt).toLocaleDateString("pt-BR", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/players/${user.id}`)}
                  >
                    Ver Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleUnfollow(user.id)}
                    disabled={unfollowingUsers.has(user.id)}
                  >
                    {unfollowingUsers.has(user.id) ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
