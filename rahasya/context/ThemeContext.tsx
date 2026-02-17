import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useColorScheme as useNativeColorScheme,
  Appearance,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";

type Theme = "light" | "dark" | "system";

type ThemeState = {
  theme: Theme;
  colorScheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

const THEME_KEY = "app_theme";

function canUseWebStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

async function saveTheme(theme: Theme): Promise<void> {
  if (Platform.OS === "web") {
    if (canUseWebStorage()) window.localStorage.setItem(THEME_KEY, theme);
    return;
  }
  await SecureStore.setItemAsync(THEME_KEY, theme);
}

async function getTheme(): Promise<Theme | null> {
  if (Platform.OS === "web") {
    if (canUseWebStorage())
      return window.localStorage.getItem(THEME_KEY) as Theme;
    return null;
  }
  return (await SecureStore.getItemAsync(THEME_KEY)) as Theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useNativeColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");

  // Load theme from storage on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const savedTheme = await getTheme();
        if (mounted && savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const getColorScheme = (): "light" | "dark" => {
    if (theme === "system") {
      return systemColorScheme || "light";
    }
    return theme;
  };

  const colorScheme = getColorScheme();

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme).catch((error) =>
      console.error("Failed to save theme:", error),
    );
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const value: ThemeState = {
    theme,
    colorScheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
