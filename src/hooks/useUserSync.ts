import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

export function useUserSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const setIsSeller = useUserStore((state) => state.setIsSeller);
  const setIsSynced = useUserStore((state) => state.setIsSynced);
  const reset = useUserStore((state) => state.reset);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      reset();
      return;
    }

    let cancelled = false;

    async function syncCurrentUser() {
      try {
        const token = await getToken();

        if (!token) {
          return;
        }

        const response = await fetch("/api/users/sync", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Unable to sync user profile");
        }

        const { isSeller } = (await response.json()) as { isSeller: boolean };

        if (!cancelled) {
          setIsSeller(isSeller);
          setIsSynced(true);
        }
      } catch {
        if (!cancelled) {
          setIsSynced(false);
        }
      }
    }

    void syncCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, reset, setIsSeller, setIsSynced]);
}
