import { useSession } from "@/lib/auth-client";
import { useHydration } from "./use-hydration";

export function useAuth() {
  const { data: session, isPending: loading, error } = useSession();
  const isHydrated = useHydration();

  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    loading: loading || !isHydrated,
    error,
    session,
    isHydrated,
  };
}
