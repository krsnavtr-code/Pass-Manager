import React from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/context/ThemeContext";
import { Fonts } from "@/constants/theme";

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
  rightComponent?: React.ReactNode;
}

export function Header({ title, onMenuPress, rightComponent }: HeaderProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  return (
    <ThemedView 
      style={[
        styles.container, 
        { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }
      ]}
    >
      {/* Left Button Slot */}
      <TouchableOpacity 
        onPress={onMenuPress} 
        style={styles.actionButton}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.iconEmoji}>☰</ThemedText>
      </TouchableOpacity>

      {/* Perfectly Centered Title */}
      <View style={styles.titleWrapper}>
        <ThemedText 
          type="title" 
          style={[
            styles.title, 
            { fontFamily: Fonts.rounded }
          ]}
        >
          {title}
        </ThemedText>
      </View>

      {/* Right Component Slot */}
      <View style={styles.rightContainer}>
        {rightComponent || <View style={{ width: 32 }} />}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    // Adjusting for status bar height on different platforms
    paddingTop: Platform.OS === "ios" ? 50 : 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  iconEmoji: {
    fontSize: 22,
  },
  titleWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    // We match the container vertical padding to center the absolute view
    top: Platform.OS === "ios" ? 50 : 15,
    bottom: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1, // Ensures buttons remain clickable
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  rightContainer: {
    minWidth: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});