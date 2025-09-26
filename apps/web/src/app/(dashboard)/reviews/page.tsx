"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Edit, Trash2, MessageSquare } from "lucide-react";
import { UserGameClientService } from "@/lib/user-games-client";
import {
  ReviewsClientService,
  CreateReviewData,
  ReviewWithGame,
  getStarRating,
  formatReviewDate,
} from "@/lib/reviews-client";

// Interface for library games
interface LibraryGame {
  id: string;
  name: string | null;
  backgroundImage: string | null;
  status: string;
  userGameId: string;
}

export default function ReviewsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithGame[]>([]);
  const [libraryGames, setLibraryGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state for creating a review
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [formData, setFormData] = useState<CreateReviewData>({
    platform: "",
    rating: 5,
    title: "",
    content: "",
    hoursPlayed: undefined,
    isRecommended: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  const userId = user?.id;

  // Platform options
  const platformOptions = [
    "PC",
    "PlayStation 5",
    "PlayStation 4",
    "Xbox Series X/S",
    "Xbox One",
    "Nintendo Switch",
    "Steam Deck",
    "Mobile",
  ];

  const fetchData = async () => {
    if (!userId || !isAuthenticated || authLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user's reviews and library games in parallel
      const [reviewsResponse, libraryResponse] = await Promise.all([
        ReviewsClientService.getUserReviews(userId),
        UserGameClientService.getUserLibrary(userId),
      ]);

      setReviews(reviewsResponse.reviews || []);
      setLibraryGames(libraryResponse.library || []);
    } catch (error) {
      console.error("Failed to fetch reviews data:", error);
      setError("Falha ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedGameId) return;

    setSubmitting(true);
    try {
      await ReviewsClientService.createReview(userId, selectedGameId, formData);

      // Reset form and close dialog
      setFormData({
        platform: "",
        rating: 5,
        title: "",
        content: "",
        hoursPlayed: undefined,
        isRecommended: undefined,
      });
      setSelectedGameId("");
      setShowCreateDialog(false);

      // Refresh reviews
      await fetchData();
    } catch (error: any) {
      console.error("Failed to create review:", error);
      setError(error.message || "Falha ao criar review. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!userId || !confirm("Tem certeza que deseja excluir esta review?"))
      return;

    try {
      await ReviewsClientService.deleteReview(reviewId, userId);
      await fetchData(); // Refresh reviews
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      setError(error.message || "Falha ao excluir review. Tente novamente.");
    }
  };

  // Get games that don't have reviews yet
  const availableGamesForReview = libraryGames.filter(
    (game) => !reviews.some((review) => review.gameId === game.id)
  );

  useEffect(() => {
    fetchData();
  }, [userId, isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="px-6 space-y-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-6 space-y-6 w-full">
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            Faça login para ver suas reviews
          </h3>
          <p className="text-gray-500">
            Você precisa estar logado para criar e gerenciar suas reviews
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Minhas Reviews</h1>
          <p className="text-gray-600 mt-1">
            Compartilhe suas opiniões sobre os jogos que você jogou
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Review</DialogTitle>
              <DialogDescription>
                Compartilhe sua opinião sobre um jogo da sua biblioteca.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Game Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Jogo</label>
                <Select
                  value={selectedGameId}
                  onValueChange={setSelectedGameId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um jogo da sua biblioteca" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGamesForReview.map((game) => {
                      // Skip games with invalid IDs (empty string, null, or undefined)
                      if (!game.name || !game.id || game.id.trim() === "")
                        return null;
                      return (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name || "Jogo sem nome"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Plataforma
                </label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData({ ...formData, platform: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nota (1-5 estrelas)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Título (opcional)
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Um jogo incrível!"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review (opcional)
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Conte o que você achou do jogo..."
                  rows={4}
                />
              </div>

              {/* Hours Played */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Horas jogadas (opcional)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.hoursPlayed || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hoursPlayed: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Ex: 25"
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Você recomenda este jogo?
                </label>
                <Select
                  value={
                    formData.isRecommended === undefined
                      ? "undefined"
                      : formData.isRecommended.toString()
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      isRecommended:
                        value === "undefined" ? undefined : value === "true",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">Prefiro não dizer</SelectItem>
                    <SelectItem value="true">Sim, recomendo</SelectItem>
                    <SelectItem value="false">Não recomendo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !selectedGameId || !formData.platform}
                >
                  {submitting ? "Criando..." : "Criar Review"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div>
        {loading ? (
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              Nenhuma review ainda
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando sua primeira review de um jogo da sua biblioteca
            </p>
            {availableGamesForReview.length > 0 ? (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Review
              </Button>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">
                  Você precisa ter jogos na sua biblioteca primeiro
                </p>
                <Button onClick={() => (window.location.href = "/games")}>
                  Explorar Jogos
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {review.game?.backgroundImage && (
                        <img
                          src={review.game.backgroundImage}
                          alt={review.game.name || "Game"}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {review.game?.name || "Jogo sem nome"}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-yellow-400">
                            {getStarRating(review.rating)}
                          </div>
                          <Badge variant="outline">{review.platform}</Badge>
                          {review.isRecommended !== null && (
                            <Badge
                              variant={
                                review.isRecommended ? "default" : "destructive"
                              }
                            >
                              {review.isRecommended
                                ? "Recomenda"
                                : "Não recomenda"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {review.title && (
                    <h4 className="font-semibold mb-2">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-gray-700 mb-3">{review.content}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {review.hoursPlayed && (
                      <span>{review.hoursPlayed}h jogado</span>
                    )}
                    <span>{formatReviewDate(review.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
