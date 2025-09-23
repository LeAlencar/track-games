"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { getStatusDisplayName, getStatusColor } from "@/lib/user-games-client";
import type { UserGameStatus } from "@/lib/user-games-client";

interface RecentActivityItem {
  id: string;
  type: "game_added" | "status_changed" | "review_created";
  gameTitle: string;
  gameImage?: string;
  status?: UserGameStatus;
  createdAt: Date;
  description: string;
}

interface RecentActivityProps {
  activities?: RecentActivityItem[];
  loading?: boolean;
}

export function RecentActivity({
  activities = [],
  loading,
}: RecentActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gamepad2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma atividade recente</p>
            <p className="text-sm text-gray-400 mt-1">
              Adicione jogos à sua biblioteca para ver atividades aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                {activity.gameImage ? (
                  <Image
                    src={activity.gameImage}
                    alt={activity.gameTitle}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <Avatar>
                    <AvatarFallback>
                      <Gamepad2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(activity.createdAt, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                  {activity.status && (
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(activity.status)} text-white text-xs`}
                    >
                      {getStatusDisplayName(activity.status)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
