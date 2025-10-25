"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Calendar, ArrowLeft, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { useAuth } from "@/hooks/use-auth";
import { UserGameClientService } from "@/lib/user-games-client";

interface Game {
  id: string;
  rawgId: number;
  name: string;
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
  metacriticScore: number | null;
  playtime: number | null;
  esrbRating: any | null;
}

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const slug = params.slug as string;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [userGameStatus, setUserGameStatus] = useState<string | undefined>();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch game details
        const response = await fetch(`/api/games/${slug}`);
        if (!response.ok) {
          throw new Error("Game not found");
        }

        const data = await response.json();
        setGame(data.game);

        // Check if game is in user's library
        if (isAuthenticated && user?.id) {
          try {
            const { userGame } = await UserGameClientService.getUserGame(
              user.id,
              data.game.id
            );
            setIsInLibrary(!!userGame);
            setUserGameStatus(userGame?.status);
          } catch (error) {
            // Game not in library
            setIsInLibrary(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch game:", error);
        setError("Jogo não encontrado");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchGame();
    }
  }, [slug, isAuthenticated, user?.id]);

  const handleLibraryChange = () => {
    // Refetch library status
    if (isAuthenticated && user?.id && game?.id) {
      UserGameClientService.getUserGame(user.id, game.id)
        .then(({ userGame }) => {
          setIsInLibrary(!!userGame);
          setUserGameStatus(userGame?.status);
        })
        .catch(() => {
          setIsInLibrary(false);
        });
    }
  };

  const formatReleaseDate = (date: Date | null) => {
    if (!date) return "Data não disponível";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const stripHtmlTags = (html: string | null) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card className="p-8 text-center">
          <Gamepad2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Jogo não encontrado</h2>
          <p className="text-gray-600 mb-4">
            O jogo que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => router.push("/games")}>Explorar Jogos</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {/* Game Header */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Game Image */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
          {game.backgroundImage ? (
            <img
              src={game.backgroundImage}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Gamepad2 className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{game.name}</h1>

            {/* Ratings */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {game.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {parseFloat(game.rating).toFixed(1)}
                  </span>
                  <span>/ {game.ratingTop || 5}</span>
                </div>
              )}

              {game.ratingsCount && (
                <span>{game.ratingsCount.toLocaleString()} avaliações</span>
              )}

              {game.metacriticScore && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Metacritic:</span>
                  <span
                    className={`px-2 py-0.5 rounded ${
                      game.metacriticScore >= 75
                        ? "bg-green-500 text-white"
                        : game.metacriticScore >= 50
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                    }`}
                  >
                    {game.metacriticScore}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Release Date */}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatReleaseDate(game.released)}</span>
          </div>

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Gêneros</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Plataformas</h3>
              <div className="flex flex-wrap gap-2">
                {game.platforms.slice(0, 6).map((p: any, index: number) => (
                  <Badge key={index} variant="outline">
                    {p.platform?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Developers */}
          {game.developers && game.developers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Desenvolvedores</h3>
              <p className="text-gray-600">
                {game.developers.map((dev: any) => dev.name).join(", ")}
              </p>
            </div>
          )}

          {/* Publishers */}
          {game.publishers && game.publishers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Publicadoras</h3>
              <p className="text-gray-600">
                {game.publishers.map((pub: any) => pub.name).join(", ")}
              </p>
            </div>
          )}

          {/* Playtime */}
          {game.playtime && game.playtime > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Tempo Médio de Jogo
              </h3>
              <p className="text-gray-600">{game.playtime} horas</p>
            </div>
          )}

          {/* ESRB Rating */}
          {game.esrbRating && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Classificação</h3>
              <Badge variant="secondary">{game.esrbRating.name}</Badge>
            </div>
          )}

          {/* Add to Library */}
          {isAuthenticated && (
            <div className="pt-4">
              <AddToLibraryButton
                gameId={game.id}
                gameName={game.name}
                isInLibrary={isInLibrary}
                currentStatus={userGameStatus as any}
                onStatusChange={handleLibraryChange}
                size="default"
                variant="default"
              />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {game.description && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Sobre o Jogo</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {stripHtmlTags(game.description)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
