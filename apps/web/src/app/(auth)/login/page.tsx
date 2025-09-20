"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        onSuccess: () => router.push("/dashboard"),
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message);
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </CardAction>
      </CardHeader>
      {error && (
        <div className="mx-6 mb-4 rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <CardContent>
        <form onSubmit={signIn}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          onClick={signIn}
        >
          {loading ? "Signing in..." : "Login"}
        </Button>
      </CardFooter>
    </Card>
  );
}
