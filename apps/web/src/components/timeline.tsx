"use client";

import { Star, Clock, Share2, Heart } from "lucide-react";
import Image from "next/image";

interface TimelineItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  game: {
    name: string;
    poster?: string;
  };
  action: "added" | "rated" | "reviewed" | "favorited";
  rating?: number;
  review?: string;
  timestamp: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = "" }: TimelineProps) {
  const getActionText = (item: TimelineItem) => {
    switch (item.action) {
      case "added":
        return `adicionou ${item.game.name} à sua biblioteca`;
      case "rated":
        return `avaliou ${item.game.name}`;
      case "reviewed":
        return `escreveu uma review de ${item.game.name}`;
      case "favorited":
        return `favoritou ${item.game.name}`;
      default:
        return `interagiu com ${item.game.name}`;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "added":
        return "📚";
      case "rated":
        return "⭐";
      case "reviewed":
        return "📝";
      case "favorited":
        return "❤️";
      default:
        return "🎮";
    }
  };

  return (
    <div className={`timeline ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="timeline-item">
          <div className="timeline-avatar">
            {item.user.avatar ? (
              <Image
                src={item.user.avatar}
                alt={item.user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              item.user.initials
            )}
          </div>
          <div className="timeline-content">
            <div className="timeline-text">
              <span className="font-semibold text-primary">{item.user.name}</span>{" "}
              {getActionText(item)}
              {item.rating && (
                <span className="ml-2">
                  <Star className="inline h-3 w-3 mr-1" />
                  {item.rating}/5
                </span>
              )}
            </div>
            
            {item.review && (
              <div className="mt-2 p-3 bg-secondary rounded border border-neutral">
                <p className="text-secondary text-sm line-clamp-3">
                  {item.review}
                </p>
              </div>
            )}
            
            <div className="timeline-meta">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{item.timestamp}</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-accent transition-colors">
                  <Share2 className="h-3 w-3" />
                  <span>Compartilhar</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-accent transition-colors">
                  <Heart className="h-3 w-3" />
                  <span>Curtir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para exibir uma timeline vazia
export function EmptyTimeline({ message = "Nenhuma atividade recente" }: { message?: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="h-8 w-8 text-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">
        {message}
      </h3>
      <p className="text-secondary">
        As atividades dos usuários aparecerão aqui quando houver conteúdo.
      </p>
    </div>
  );
}

// Hook para dados de exemplo da timeline
export function useTimelineData(): TimelineItem[] {
  return [
    {
      id: "1",
      user: {
        name: "João Silva",
        initials: "JS",
      },
      game: {
        name: "Cyberpunk 2077",
      },
      action: "rated",
      rating: 4.5,
      timestamp: "2 horas atrás",
    },
    {
      id: "2",
      user: {
        name: "Maria Santos",
        initials: "MS",
      },
      game: {
        name: "The Witcher 3",
      },
      action: "reviewed",
      rating: 5,
      review: "Um dos melhores RPGs que já joguei. A história é envolvente, os personagens são memoráveis e o mundo é incrivelmente detalhado. Recomendo para qualquer fã do gênero!",
      timestamp: "4 horas atrás",
    },
    {
      id: "3",
      user: {
        name: "Pedro Costa",
        initials: "PC",
      },
      game: {
        name: "Elden Ring",
      },
      action: "favorited",
      timestamp: "6 horas atrás",
    },
    {
      id: "4",
      user: {
        name: "Ana Oliveira",
        initials: "AO",
      },
      game: {
        name: "Hollow Knight",
      },
      action: "added",
      timestamp: "1 dia atrás",
    },
    {
      id: "5",
      user: {
        name: "Carlos Lima",
        initials: "CL",
      },
      game: {
        name: "God of War",
      },
      action: "reviewed",
      rating: 4.8,
      review: "Uma obra-prima da narrativa em jogos. A relação entre Kratos e Atreus é tocante e bem desenvolvida.",
      timestamp: "2 dias atrás",
    },
  ];
}
