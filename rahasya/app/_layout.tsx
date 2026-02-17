import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
import { BottomNav } from "@/components/bottom-nav";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Prevent splash screen from auto-hiding before auth check
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(auth)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Check if we are in an authenticated area
  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (!isLoading) {
      // Hide splash screen once auth state is determined
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="vault"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="add-password"
            options={{ presentation: "containedModal" }}
          />
        </Stack>

        {/* Only show BottomNav if:
            1. User is logged in (has token)
            2. Not currently on an authentication screen
        */}
        {token && !inAuthGroup && <BottomNav />}
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppThemeProvider>
  );
}
