"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, GamepadIcon, MessageSquareIcon, Calendar } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  gamesCount: number;
  reviewsCount: number;
}

export default function PlayersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          setError("Erro ao carregar usuários");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Jogadores</h1>
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
          <Users className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Jogadores</h1>
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
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Jogadores</h1>
      </div>

      <p className="text-muted-foreground mb-6">
        Descubra outros jogadores da comunidade Ludexicon
      </p>

      {/* Users Grid */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum jogador encontrado
          </h3>
          <p className="text-muted-foreground">
            Ainda não há outros usuários na plataforma.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
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
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">Membro desde</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Button - For future implementation */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/players/${user.id}`)}
                  >
                    Ver Perfil
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
