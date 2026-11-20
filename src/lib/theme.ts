/**
 * Theme preference shared by the inline init script (runs before first paint)
 * and the client-side `useTheme` hook. Both must resolve the theme with the
 * same rule, otherwise the theme flips right after hydration.
 *
 * Rule: a stored "light"/"dark" wins; anything else (nothing stored, unknown
 * value, storage unavailable) -> follow the OS setting.
 */
// Prefixed so another app on the same origin (e.g. localhost:3000) can't leave
// an incompatible value behind (next-themes stores "system" under "theme").
export const THEME_STORAGE_KEY = "revvv-theme";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

export type Theme = "light" | "dark";

/**
 * Runs synchronously in <head> while the HTML is parsed, so the `dark` class
 * is on <html> before anything is painted (no flash of the wrong theme).
 * See: node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export const themeInitScript = `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}var d=t==="dark"||(t!=="light"&&matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);document.documentElement.classList.toggle("dark",d)})()`;
