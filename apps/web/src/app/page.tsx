"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Star, Users, BarChart3, Heart, Library, Search, ArrowRight, Play, Trophy, Clock, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { LoadingScreen } from "@/components/loading-screen";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Show loading state during hydration
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Ludexicon</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-orange-900">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="text-white hover:bg-white/10"
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-orange-900">
                    Entrar
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-orange-500/20 text-orange-300 border-orange-500/30">
            🎮 A plataforma definitiva para gamers
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Organize sua
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> biblioteca</span>
            <br />
            de jogos
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubra novos jogos, organize sua biblioteca, acompanhe seu progresso e conecte-se com outros gamers. 
            Tudo em uma plataforma moderna e intuitiva.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6">
                  Ir para Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6">
                    Começar Grátis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-900 text-lg px-8 py-6">
                    Já tenho conta
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Por que escolher o Ludexicon?
            </h2>
            <p className="text-gray-300 text-lg">
              Ferramentas poderosas para gamers sérios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Biblioteca Organizada</h3>
                <p className="text-gray-300">
                  Organize seus jogos por status, plataforma, gênero e muito mais. 
                  Nunca mais perca um jogo na sua coleção.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Estatísticas Detalhadas</h3>
                <p className="text-gray-300">
                  Acompanhe suas horas jogadas, progresso, conquistas e muito mais. 
                  Veja sua evolução como gamer.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Descoberta de Jogos</h3>
                <p className="text-gray-300">
                  Explore milhares de jogos, leia reviews da comunidade e descubra 
                  seu próximo jogo favorito.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Sistema de Favoritos</h3>
                <p className="text-gray-300">
                  Marque seus jogos favoritos e crie listas personalizadas. 
                  Compartilhe suas recomendações com amigos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Conquistas</h3>
                <p className="text-gray-300">
                  Desbloqueie conquistas especiais e acompanhe seus marcos como gamer. 
                  Compartilhe suas vitórias.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Comunidade</h3>
                <p className="text-gray-300">
                  Conecte-se com outros gamers, compartilhe reviews e descubra 
                  jogos através da comunidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 text-center">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-slate-800/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">10K+</div>
              <div className="text-gray-300">Jogos Disponíveis</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">5K+</div>
              <div className="text-gray-300">Usuários Ativos</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">50K+</div>
              <div className="text-gray-300">Reviews</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">1M+</div>
              <div className="text-gray-300">Horas Registradas</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl p-12 border border-orange-500/30">
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para organizar sua biblioteca?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Junte-se a milhares de gamers que já organizaram suas bibliotecas com o Ludexicon
            </p>
            {!isAuthenticated && (
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6">
                  Começar Agora - É Grátis!
                  <Play className="ml-2 w-5 h-5" />
        </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Ludexicon</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 Ludexicon. Feito com ❤️ para gamers.
          </div>
        </div>
      </footer>
    </div>
  );
}
