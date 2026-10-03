"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const handleThemeToggle = useCallback(
    (e) => {
      const newMode = resolvedTheme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      // Set coordinates from the click event
      if (e) {
        root.style.setProperty("--x", `${e.clientX}px`);
        root.style.setProperty("--y", `${e.clientY}px`);
      }

      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [resolvedTheme, setTheme],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      className="group/toggle size-8 cursor-pointer"
      onClick={handleThemeToggle}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
