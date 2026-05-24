import { router } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "./auth";

export function useProtectedRoute() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn]);

  return isLoggedIn;
}
