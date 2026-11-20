"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <SunIcon aria-hidden className="size-4 text-muted-foreground" />
      <Switch
        // TODO(REV-18): move the label to next-intl messages.
        aria-label="Tryb ciemny"
        data-testid="theme-switch"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <MoonIcon aria-hidden className="size-4 text-muted-foreground" />
    </div>
  );
}
