import React from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const Icons = {
  Dashboard: "⊞",
  Vault: "🔑",
  Profile: "👤",
};

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useTheme();
  const { token } = useAuth();

  const isDark = colorScheme === "dark";

  // Hide on auth screens or if logged out
  if (!token || pathname.startsWith("/(auth)")) return null;

  const menuItems = [
    { icon: "Dashboard", label: "Home", href: "/(tabs)" },
    { icon: "Vault", label: "Vault", href: "/vault" },
    { icon: "Profile", label: "Profile", href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/(tabs)")
      return pathname === "/" || pathname.endsWith("/index");
    return pathname.includes(href.replace("/(tabs)/", ""));
  };

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: isDark
              ? "rgba(30, 41, 59, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: isDark ? "#334155" : "#E2E8F0",
          },
        ]}
      >
        {/* Top Accent Line */}
        <View style={styles.accentLine} />

        <View style={styles.navContent}>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const activeColor = isDark ? "#60A5FA" : "#2563EB";
            const inactiveColor = isDark ? "#94A3B8" : "#64748B";

            return (
              <TouchableOpacity
                key={item.href}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => router.push(item.href as any)}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.icon,
                    { color: active ? activeColor : inactiveColor },
                  ]}
                >
                  {Icons[item.icon as keyof typeof Icons]}
                </ThemedText>

                <ThemedText
                  style={[
                    styles.label,
                    {
                      color: active ? activeColor : inactiveColor,
                      fontWeight: active ? "800" : "500",
                    },
                  ]}
                >
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  navBar: {
    width: "auto",
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  accentLine: {
    height: 2,
    backgroundColor: "#3B82F6",
    opacity: 0.3,
    width: "auto",
  },
  navContent: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 12,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderRadius: 16,
    position: "relative",
  },
  navItemActive: {
    // Subtle background for active state
  },
  icon: {
    fontSize: 20,
    marginBottom: 0,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
