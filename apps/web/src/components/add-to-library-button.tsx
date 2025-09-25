"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Loader2, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserGameClientService,
  getStatusDisplayName,
  type UserGameStatus,
  type UserGamePriority,
} from "@/lib/user-games-client";
import { useAuth } from "@/hooks/use-auth";

interface AddToLibraryButtonProps {
  gameId: string;
  gameName: string;
  isInLibrary?: boolean;
  currentStatus?: UserGameStatus;
  onStatusChange?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  isFavorite?: boolean;
}

const statusOptions: UserGameStatus[] = [
  "want_to_play",
  "playing",
  "completed",
  "on_hold",
  "dropped",
];

const priorityOptions: UserGamePriority[] = ["low", "medium", "high"];

const platforms = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X/S",
  "Xbox One",
  "Nintendo Switch",
  "Mobile",
  "Steam Deck",
  "Other",
];

export function AddToLibraryButton({
  gameId,
  gameName,
  isInLibrary = false,
  currentStatus,
  onStatusChange,
  variant = "default",
  size = "default",
  isFavorite = false,
}: AddToLibraryButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isCurrentlyFavorite, setIsCurrentlyFavorite] = useState(isFavorite);
  const [status, setStatus] = useState<UserGameStatus>(
    currentStatus || "want_to_play"
  );
  const [priority, setPriority] = useState<UserGamePriority>("medium");
  const [platform, setPlatform] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");

  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  // Update favorite state when prop changes
  useEffect(() => {
    setIsCurrentlyFavorite(isFavorite);
  }, [isFavorite]);

  // Fetch and populate form state when editing existing entries
  useEffect(() => {
    const fetchUserGameData = async () => {
      if (isInLibrary && userId) {
        setFetchingData(true);
        try {
          const response = await UserGameClientService.getUserGame(
            userId,
            gameId
          );
          if (response.userGame) {
            const userGame = response.userGame;
            setStatus(userGame.status || "want_to_play");
            setPriority(userGame.priority || "medium");
            setPlatform(userGame.platform || "");
            setPersonalNotes(userGame.personalNotes || "");
            setIsCurrentlyFavorite(userGame.isFavorite || false);
          }
        } catch (error) {
          console.error("Failed to fetch user game data:", error);
          // Fallback to currentStatus if fetch fails
          if (currentStatus) {
            setStatus(currentStatus);
          }
        } finally {
          setFetchingData(false);
        }
      } else if (!isInLibrary) {
        // Reset form for new entries
        setStatus("want_to_play");
        setPriority("medium");
        setPlatform("");
        setPersonalNotes("");
        setIsCurrentlyFavorite(false);
      }
    };

    if (userId) {
      fetchUserGameData();
    }
  }, [isInLibrary, currentStatus, userId, gameId]);

  const handleAddToLibrary = async () => {
    if (!userId || !isAuthenticated) {
      console.error("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      if (isInLibrary) {
        // Update existing entry
        await UserGameClientService.updateUserGame(userId, gameId, {
          status,
          priority,
          platform: platform || null,
          personalNotes: personalNotes || null,
        });
      } else {
        // Add new entry
        await UserGameClientService.addGameToLibrary(userId, gameId, {
          status,
          priority,
          platform: platform || null,
          personalNotes: personalNotes || null,
        });
      }

      onStatusChange?.();
      setOpen(false);
    } catch (error) {
      console.error("Failed to update library:", error);
      // TODO: Add toast notification for error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!userId || !isAuthenticated) return;

    setFavoriteLoading(true);
    try {
      if (!isInLibrary) {
        // If game is not in library, add it as favorite with default status
        await UserGameClientService.addGameToLibrary(userId, gameId, {
          status: "want_to_play",
          priority: "medium",
          isFavorite: true,
        });
        setIsCurrentlyFavorite(true);
      } else {
        // If game is in library, toggle favorite status
        const response = await UserGameClientService.toggleFavorite(userId, gameId);
        setIsCurrentlyFavorite(response.isFavorite);
      }
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!userId || !isAuthenticated) {
      console.error("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      await UserGameClientService.removeGameFromLibrary(userId, gameId);
      onStatusChange?.();
      setOpen(false);
    } catch (error) {
      console.error("Failed to remove from library:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isInLibrary) {
    return (
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={variant} size={size} className="gap-2">
              <Check className="h-4 w-4" />
              {currentStatus
                ? getStatusDisplayName(currentStatus)
                : "Na Biblioteca"}
            </Button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Atualizar na Biblioteca</DialogTitle>
            <DialogDescription>
              Atualizar o status de "{gameName}" na sua biblioteca.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {fetchingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-gray-600">
                  Carregando dados...
                </span>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as UserGameStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {getStatusDisplayName(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(value as UserGamePriority)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas Pessoais</Label>
                  <Textarea
                    id="notes"
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Adicionar notas pessoais sobre o jogo..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddToLibrary}
              disabled={loading || fetchingData}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Atualizar"
              )}
            </Button>
            <Button
              onClick={handleRemoveFromLibrary}
              disabled={loading || fetchingData}
              variant="destructive"
            >
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Favorite Button */}
      <Button
        size={size}
        variant="ghost"
        className={`p-2 ${
          isCurrentlyFavorite 
            ? "text-red-500 hover:text-red-600" 
            : "text-gray-400 hover:text-red-500"
        }`}
        onClick={handleToggleFavorite}
        disabled={favoriteLoading}
        title={isCurrentlyFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart 
          className={`h-4 w-4 ${
            isCurrentlyFavorite ? "fill-current" : ""
          }`} 
        />
      </Button>
    </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar à Biblioteca
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar à Biblioteca</DialogTitle>
          <DialogDescription>
            Adicionar "{gameName}" à sua biblioteca de jogos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as UserGameStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {getStatusDisplayName(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as UserGamePriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="platform">Plataforma</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notas Pessoais</Label>
            <Textarea
              id="notes"
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Adicionar notas pessoais sobre o jogo..."
              rows={3}
            />
          </div>
        </div>

        <Button
          onClick={handleAddToLibrary}
          disabled={loading || fetchingData}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adicionando...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Adicionar à Biblioteca
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
    
    {/* Favorite Button */}
    <Button
      size={size}
      variant="ghost"
      className={`p-2 ${
        isCurrentlyFavorite 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-400 hover:text-red-500"
      }`}
      onClick={handleToggleFavorite}
      disabled={favoriteLoading}
      title={isCurrentlyFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart 
        className={`h-4 w-4 ${
          isCurrentlyFavorite ? "fill-current" : ""
        }`} 
      />
    </Button>
  </div>
  );
}
