"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const THEME_CHANGE_EVENT = "revvv:themechange";

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** Stored choice wins; without one we follow the OS (same rule as `themeInitScript`). */
function resolveTheme(): Theme {
  return readStoredTheme() ?? (matchMedia(DARK_QUERY).matches ? "dark" : "light");
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function subscribe(onChange: () => void) {
  const media = matchMedia(DARK_QUERY);
  const handleChange = () => {
    applyTheme(resolveTheme());
    onChange();
  };

  media.addEventListener("change", handleChange); // OS theme changed
  window.addEventListener("storage", handleChange); // changed in another tab
  window.addEventListener(THEME_CHANGE_EVENT, handleChange); // changed in this tab

  return () => {
    media.removeEventListener("change", handleChange);
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  };
}

// The server can't know the theme, so it renders "unknown"; the client value follows right after hydration.
const getServerSnapshot = () => null;

export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, resolveTheme, getServerSnapshot);

  // Dev only: Strict Mode remounts reset <html> attributes to what JSX declares,
  // dropping the `dark` class set by the inline script. No-op in production.
  useLayoutEffect(() => {
    applyTheme(resolveTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (e.g. privacy mode): the choice just won't persist.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return { theme, setTheme };
}
