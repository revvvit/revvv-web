/**
 * Theme preference shared by the inline init script (runs before first paint)
 * and the client-side `useTheme` hook. Both must read the same source,
 * otherwise React's state and the DOM disagree after hydration.
 */
export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

/**
 * Runs synchronously in <head> while the HTML is parsed, so the `dark` class
 * is on <html> before anything is painted (no flash of the wrong theme).
 * No stored preference -> follow the OS setting.
 * See: node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
