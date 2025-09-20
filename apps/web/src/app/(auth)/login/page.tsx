"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
// IMPORTANTE: coloque <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap" rel="stylesheet"> no _app ou Head

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await authClient.signIn.email(
      {
        email,
        password,
        rememberMe: remember,
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => router.push("/"),
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message);
        },
      }
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#150042] via-[#2c0357] to-[#0e0732] text-white overflow-hidden">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25 bg-[url('/images/scanlines.svg')]" />
      {/* Glow/Blur background decoration */}
      <div className="absolute inset-0 z-0 flex items-center justify-center blur-2xl opacity-40">
         <div className="h-96 w-96 rounded-full bg-purple-700 opacity-60 filter blur-2xl" />
      </div>
      <div className="z-10 mx-auto w-full max-w-[420px] bg-opacity-60 rounded-2xl border border-purple-900 shadow-2xl backdrop-blur-2xl px-7 py-9">
        <div className="mb-7 text-center">
          {/* Logo ou Icon */}
          <div className="flex justify-center mb-3">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg ring-4 ring-purple-600/80">
              {/* Ícone de controle/jogo (você pode trocar por um SVG ou imagem de logo real) */}
              <svg width="38" height="38" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M6.25 16.5l..."/></svg>
            </span>
          </div>
          <h1 
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ fontFamily: "'Orbitron', 'sans-serif'" }}
          >
            Track Games
          </h1>
          <p className="font-light text-purple-100">
            Entre para acessar seu painel de reviews
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/70 py-2 px-4 text-center text-sm text-red-200 ring-1 ring-red-800 shadow">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={signIn}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-purple-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 block w-full rounded-lg py-3 pl-4 pr-2 bg-zinc-950/90 text-purple-100 border-2 border-purple-900/50 focus:ring-2 focus:ring-purple-600 focus:border-purple-500 placeholder:text-purple-300"
              placeholder="you@email.com"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-purple-200">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 block w-full rounded-lg py-3 pl-4 pr-2 bg-zinc-950/90 text-purple-100 border-2 border-purple-900/50 focus:ring-2 focus:ring-purple-600 focus:border-purple-500 placeholder:text-purple-300"
              placeholder="Sua senha"
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-purple-600 focus:ring-2 focus:ring-purple-600 accent-purple-700"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-3 text-sm text-purple-300">
                Lembrar-me
              </label>
            </div>
            <div className="text-sm">
              <a href="/forget-password" className="font-medium text-purple-300 hover:text-pink-400 transition">
                Esqueceu a senha?
              </a>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="relative w-full mt-2 bg-gradient-to-r from-purple-700 to-pink-600 py-3 rounded-xl font-orbitron font-bold hover:from-pink-600 hover:to-purple-700 transition shadow-[0_0_16px_4px_rgba(174,51,255,0.6)] enabled:hover:brightness-110 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 active:scale-[.97]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white opacity-70" fill="none" viewBox="0 0 24 24"><circle className="opacity-50" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4"/><path d="M4 12a8 8 0 018-8" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></svg>
                Entrando...
              </span>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>
        <div className="mt-7 text-center text-sm">
          <p className="text-purple-300">
            Não tem conta?
            <Link className="ml-2 font-semibold text-pink-400 underline hover:text-pink-200 transition" href="/signup">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
