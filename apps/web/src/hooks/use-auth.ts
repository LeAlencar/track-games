import { useSession } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending: loading, error } = useSession();

  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    loading,
    error,
    session,
  };
}
