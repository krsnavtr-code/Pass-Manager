import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Fonts } from "@/constants/theme";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.4;

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

export function Sidebar({ isVisible, onClose }: SidebarProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { theme, colorScheme, toggleTheme } = useTheme();
  const isDark = colorScheme === "dark";

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isVisible ? 0 : -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true, // Switched to true for better performance
      }),
      Animated.timing(opacity, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible]);

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 100);
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
    router.replace("/(auth)/login");
  };

  if (!isVisible) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isVisible ? "auto" : "none"}
    >
      {/* Dimmed Overlay */}
      <Animated.View style={[styles.overlay, { opacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sidebar Drawer */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            transform: [{ translateX }],
          },
        ]}
      >
        <ThemedView style={styles.container}>
          {/* User Profile Header */}
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
              ]}
            >
              <ThemedText style={styles.avatarEmoji}>👤</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.userName}>
                {user?.name || "Vault User"}
              </ThemedText>
              <ThemedText style={styles.userEmail}>
                {user?.email || "Encrypted Session"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Menu Items */}
          <View style={styles.menuItems}>
            <MenuButton
              icon="🔐"
              label="Passwords"
              onPress={() => handleNavigation("/(tabs)")}
            />
            <MenuButton
              icon="➕"
              label="Add New"
              onPress={() => handleNavigation("/add-password")}
            />
            <MenuButton
              icon="✨"
              label="Vault Actions"
              onPress={() => handleNavigation("/vault")}
            />
            <MenuButton
              icon="⚙️"
              label="Settings"
              onPress={() => handleNavigation("/(tabs)/settings")}
            />

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <ThemedText style={styles.menuIcon}>
                {theme === "dark" ? "🌙" : "☀️"}
              </ThemedText>
              <View>
                <ThemedText style={styles.menuLabel}>Display Theme</ThemedText>
                <ThemedText style={styles.themeSubtext}>
                  Currently:{" "}
                  {theme === "system" ? `System (${colorScheme})` : theme}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Logout at Bottom */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>🚪 Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    </View>
  );
}

// Sub-component for clean menu items
function MenuButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <ThemedText style={styles.menuIcon}>{icon}</ThemedText>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 100,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: "100%",
    zIndex: 101,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: { elevation: 10 },
    }),
  },
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: { fontSize: 24 },
  userName: { fontSize: 18, fontWeight: "700", fontFamily: Fonts.rounded },
  userEmail: { fontSize: 12, opacity: 0.5 },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.05)", marginBottom: 20 },
  menuItems: { flex: 1, gap: 5 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    gap: 15,
  },
  menuIcon: { fontSize: 20, width: 30 },
  menuLabel: { fontSize: 16, fontWeight: "600" },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 15,
    marginTop: 10,
  },
  themeSubtext: { fontSize: 11, opacity: 0.5, fontWeight: "500" },
  logoutButton: {
    marginBottom: Platform.OS === "ios" ? 40 : 20,
    padding: 20,
    backgroundColor: "rgba(255, 68, 68, 0.05)",
    borderRadius: 20,
    alignItems: "center",
  },
  logoutText: { color: "#ff4444", fontWeight: "700", fontSize: 15 },
});
