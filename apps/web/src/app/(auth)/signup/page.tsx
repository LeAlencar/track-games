"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
// Lembre de importar <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap" rel="stylesheet"> no _app/head

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    await authClient.signUp.email(
      {
        email,
        password,
        name,
        image: undefined,
      },
      {
        onSuccess: () => {
          setLoading(false);
          router.push("/");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
        },
        onResponse: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#150042] via-[#2c0357] to-[#0e0732] text-white overflow-hidden">
      {/* Overlay scanlines */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25 bg-[url('/images/scanlines.svg')]" />
      {/* Efeito glow de fundo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center blur-2xl opacity-40">
        <div className="h-96 w-96 rounded-full bg-pink-600 opacity-60 filter blur-2xl" />
      </div>
      <div className="z-10 mx-auto w-full max-w-[420px] bg-opacity-50 rounded-2xl border border-purple-900 shadow-2xl backdrop-blur-2xl px-7 py-9">
        <div className="mb-7 text-center">
          {/* Logo fake/Icon */}
          <div className="flex justify-center mb-3">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg ring-4 ring-pink-800/80">
              {/* Ícone de controle, pode trocar por SVG real */}
              <svg width="38" height="38" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M6.25 16.5l..."/></svg>
            </span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ fontFamily: "'Orbitron', 'sans-serif'" }}
          >
            Criar Conta
          </h1>
          <p className="font-light text-purple-100">
            Venha para o universo Track Games!
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/70 py-2 px-4 text-center text-sm text-red-200 ring-1 ring-red-800 shadow">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={signUp}>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-pink-200">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg py-3 pl-4 pr-2 bg-zinc-950/90 text-pink-100 border-2 border-pink-900/40 focus:ring-2 focus:ring-pink-600 focus:border-pink-500 placeholder:text-pink-300"
              placeholder="Seu nome"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-pink-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg py-3 pl-4 pr-2 bg-zinc-950/90 text-pink-100 border-2 border-pink-900/40 focus:ring-2 focus:ring-pink-600 focus:border-pink-500 placeholder:text-pink-300"
              placeholder="you@email.com"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-pink-200">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-lg py-3 pl-4 pr-2 bg-zinc-950/90 text-pink-100 border-2 border-pink-900/40 focus:ring-2 focus:ring-pink-600 focus:border-pink-500 placeholder:text-pink-300"
              placeholder="Crie uma senha segura"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="relative w-full mt-2 bg-gradient-to-r from-purple-700 to-pink-600 py-3 rounded-xl font-orbitron font-bold hover:from-pink-600 hover:to-purple-700 transition shadow-[0_0_16px_4px_rgba(255,51,174,0.6)] enabled:hover:brightness-110 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 active:scale-[.97]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white opacity-70" fill="none" viewBox="0 0 24 24"><circle className="opacity-50" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4"/><path d="M4 12a8 8 0 018-8" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></svg>
                Criando...
              </span>
            ) : (
              <span>Criar Conta</span>
            )}
          </button>
        </form>
        <div className="mt-7 text-center text-sm">
          <p className="text-pink-300">
            Já tem conta?
            <Link className="ml-2 font-semibold text-purple-400 underline hover:text-pink-200 transition" href="/login">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
