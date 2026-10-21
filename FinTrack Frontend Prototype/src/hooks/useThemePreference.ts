import { useEffect } from "react";

import { useUserProfile } from "@/hooks/useUserProfile";

/**
 * Applies the stored theme preference to the document root.
 *
 * Runs in an effect (never during render) so SSR output and the hydrated DOM
 * agree — the class is added only on the client, after hydration.
 */
export function useThemePreference(): void {
  const { preferences } = useUserProfile();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", preferences.theme === "dark");
  }, [preferences.theme]);
}
