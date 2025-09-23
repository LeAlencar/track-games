"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Gamepad2,
  Star,
  Clock,
  Trophy,
  BookOpen,
  Heart,
  TrendingUp,
  Target,
} from "lucide-react";

interface DashboardStatsProps {
  stats?: {
    total: number;
    playing: number;
    completed: number;
    want_to_play: number;
    dropped: number;
    on_hold: number;
    favorites: number;
    totalHoursPlayed: number;
  };
  loading?: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Jogos na Biblioteca",
      value: stats?.total || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Jogando Atualmente",
      value: stats?.playing || 0,
      icon: Gamepad2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Jogos Concluídos",
      value: stats?.completed || 0,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },

    {
      title: "Quero Jogar",
      value: stats?.want_to_play || 0,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
