import React, { useState, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  FlatList,
  ActivityIndicator,
  Text,
  TextInput,
  Alert,
  Clipboard,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Header } from "@/components/header";
import { Fonts } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { createApiClient } from "@/lib/api";

interface PasswordEntry {
  _id: string;
  website: string;
  username: string;
  category: "social" | "work" | "finance" | "shopping" | "other";
  notes?: string;
  url?: string;
  tags: string[];
  isFavorite: boolean;
  lastModified: string;
}

export default function VaultScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { token } = useAuth();
  const isDark = colorScheme === "dark";

  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    website: "",
    username: "",
    password: "",
    masterPassword: "",
    category: "other" as const,
    url: "",
    notes: "",
    tags: "",
  });

  const api = createApiClient({
    getAuthToken: async () => token,
  });

  useEffect(() => {
    if (token) {
      fetchPasswords();
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchPasswords();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const response = await api.getPasswords();
      if (response.success) {
        setPasswords(response.passwords || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch passwords");
    } finally {
      setLoading(false);
    }
  };

  const filteredPasswords = passwords.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      // Note: API needs updatePassword method
      setPasswords((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFavorite: !current } : p)),
      );
    } catch (err) {
      setError("Failed to update favorite status");
    }
  };

  const handleReveal = async (id: string) => {
    if (visibleIds[id]) {
      setVisibleIds((prev) => ({ ...prev, [id]: false }));
      return;
    }

    Alert.alert(
      "Master Password Required",
      "Enter your master password to decrypt this password",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => {
            // For now, we'll show a placeholder
            // In a real implementation, you'd show a password input modal
            setDecryptedMap((prev) => ({
              ...prev,
              [id]: "decrypted-password-placeholder",
            }));
            setVisibleIds((prev) => ({ ...prev, [id]: true }));
          },
        },
      ],
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setString(text);
      Alert.alert("Copied", "Text copied to clipboard");
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Password",
      "Are you sure you want to delete this password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deletePassword(id);
              setPasswords((prev) => prev.filter((p) => p._id !== id));
              setDecryptedMap((prev) => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
              });
              setVisibleIds((prev) => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
              });
            } catch (err: any) {
              setError(err.message || "Failed to delete password");
            }
          },
        },
      ],
    );
  };

  const handleCreate = async () => {
    if (
      !formData.website ||
      !formData.username ||
      !formData.password ||
      !formData.masterPassword
    ) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
      };

      const response = await api.createPassword(payload);
      if (response.success) {
        setShowAddForm(false);
        setFormData({
          website: "",
          username: "",
          password: "",
          masterPassword: "",
          category: "other",
          url: "",
          notes: "",
          tags: "",
        });
        fetchPasswords();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderPasswordItem = ({ item }: { item: PasswordEntry }) => (
    <View
      style={[
        styles.passwordItem,
        { borderBottomColor: isDark ? "#374151" : "#e5e7eb" },
      ]}
    >
      <View style={styles.passwordHeader}>
        <View style={styles.serviceInfo}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            <Text
              style={[
                styles.iconText,
                { color: getCategoryTextColor(item.category) },
              ]}
            >
              {item.website[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.serviceDetails}>
            <View style={styles.serviceNameRow}>
              <ThemedText style={styles.serviceName}>{item.website}</ThemedText>
              {item.isFavorite && <Text style={styles.star}>⭐</Text>}
            </View>
            {item.url && (
              <Text
                style={[
                  styles.urlText,
                  { color: isDark ? "#9ca3af" : "#6b7280" },
                ]}
              >
                {item.url.replace("https://", "")}
              </Text>
            )}
          </View>
        </View>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: getCategoryTextColor(item.category) },
            ]}
          >
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.passwordDetails}>
        <Text
          style={[styles.username, { color: isDark ? "#d1d5db" : "#374151" }]}
        >
          {item.username}
        </Text>
        <Text
          style={[styles.password, { color: isDark ? "#9ca3af" : "#6b7280" }]}
        >
          {visibleIds[item._id] ? decryptedMap[item._id] : "••••••••••••"}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            item.isFavorite && styles.favoriteButton,
          ]}
          onPress={() => toggleFavorite(item._id, item.isFavorite)}
        >
          <Text
            style={item.isFavorite ? styles.favoriteIcon : styles.actionIcon}
          >
            ⭐
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleReveal(item._id)}
        >
          <Text style={styles.actionIcon}>
            {visibleIds[item._id] ? "🙈" : "👁️"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => copyToClipboard(item.username)}
        >
          <Text style={styles.actionIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "finance":
        return isDark ? "#065f46" : "#d1fae5";
      case "work":
        return isDark ? "#581c87" : "#f3e8ff";
      case "social":
        return isDark ? "#1e3a8a" : "#dbeafe";
      default:
        return isDark ? "#374151" : "#f3f4f6";
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case "finance":
        return "#10b981";
      case "work":
        return "#8b5cf6";
      case "social":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Vault" onMenuPress={() => router.back()} />

      {/* Search Input */}
      <View
        style={[
          styles.searchSection,
          { backgroundColor: isDark ? "#1f2937" : "#f9fafb" },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: isDark ? "#374151" : "#ffffff",
              color: isDark ? "#f9fafb" : "#111827",
              borderColor: isDark ? "#4b5563" : "#d1d5db",
            },
          ]}
          placeholder="Search website or username..."
          placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Add Password Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: isDark ? "#3b82f6" : "#2563eb" },
        ]}
        onPress={() => router.push("/add-password")}
      >
        <Text style={styles.addButtonText}>+ Add Password</Text>
      </TouchableOpacity>

      {/* Password List or Actions */}
      {loading ? (
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <ThemedText style={styles.emoji}>✨</ThemedText>
          </View>

          <ThemedText style={styles.subtitle}>
            Choose an action to manage your secure credentials.
          </ThemedText>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: "#007AFF" }]}
              onPress={() => router.push("/add-password")}
            >
              <ThemedText style={styles.buttonText}>
                ➕ Add New Password
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
              ]}
              onPress={() => router.back()}
            >
              <ThemedText
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? "#F8FAFC" : "#475569" },
                ]}
              >
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>

          <Link href="/" dismissTo style={styles.homeLink}>
            <ThemedText type="link" style={styles.linkText}>
              Return to Dashboard
            </ThemedText>
          </Link>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={filteredPasswords}
            renderItem={renderPasswordItem}
            keyExtractor={(item) => item._id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  passwordItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
  },
  star: {
    fontSize: 14,
  },
  urlText: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
  },
  passwordDetails: {
    gap: 4,
  },
  username: {
    fontSize: 14,
  },
  password: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  favoriteButton: {
    backgroundColor: "#fef3c7",
  },
  actionIcon: {
    fontSize: 16,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#cbd5e1",
    borderRadius: 3,
    position: "absolute",
    top: 12,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flex: 1,
    padding: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.6,
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  homeLink: {
    marginTop: 24,
    paddingVertical: 10,
  },
  linkText: {
    fontWeight: "700",
  },
});
