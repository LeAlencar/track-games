import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Páginas de autenticação - redireciona para dashboard se já estiver logado
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup"
  ) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Landing page - acessível para todos
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  // Rotas protegidas - requer autenticação
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/",
    "/login",
    "/signup",
    "/games/:path*",
    "/library",
    "/favorites",
    "/reviews",
    "/players/:path*",
    "/following",
  ], // Apply middleware to specific routes
};
