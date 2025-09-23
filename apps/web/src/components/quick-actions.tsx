"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Star, BookOpen, TrendingUp, Target } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Explorar Jogos",
      description: "Descubra novos jogos para adicionar à sua biblioteca",
      icon: Search,
      href: "/games",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Minha Biblioteca",
      description: "Gerencie seus jogos e acompanhe seu progresso",
      icon: BookOpen,
      href: "/library",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Escrever Review",
      description: "Compartilhe sua opinião sobre um jogo",
      icon: Star,
      href: "/reviews/new",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Tendências",
      description: "Veja os jogos mais populares da comunidade",
      icon: TrendingUp,
      href: "/trending",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center text-center hover:border-primary/20 group"
                >
                  <div
                    className={`p-3 rounded-full ${action.color} mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">{action.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
