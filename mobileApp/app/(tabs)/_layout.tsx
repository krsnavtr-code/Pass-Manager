import { Stack } from "expo-router";
import React from "react";

/**
 * Tab Layout handles the sub-stack within the authenticated tab area.
 * The BottomNav is rendered at the Root level, so we keep this
 * screen-only logic clean.
 */
export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Standardizing a slight fade for tab transitions to feel premium
        animation: "fade",
        contentStyle: {
          backgroundColor: "transparent", // Allows ThemeProvider background to show through
        },
      }}
    >
      {/* index refers to the DashboardScreen */}
      <Stack.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />

      {/* settings page */}
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Stack>
  );
}
