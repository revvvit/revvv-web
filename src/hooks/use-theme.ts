"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";

import { DARK_QUERY, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const THEME_CHANGE_EVENT = "revvv:themechange";

// Holds the choice when localStorage can't save it (blocked site data, full quota),
// so the switch still works until the page is reloaded.
let unsavedTheme: Theme | null = null;

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
  return unsavedTheme ?? readStoredTheme() ?? (matchMedia(DARK_QUERY).matches ? "dark" : "light");
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
      unsavedTheme = null;
    } catch {
      unsavedTheme = next;
    }
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return { theme, setTheme };
}
