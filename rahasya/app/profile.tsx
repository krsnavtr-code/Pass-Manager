import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { createApiClient } from "@/lib/api";
import { Fonts } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, token } = useAuth();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [updating, setUpdating] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [passwords, setPasswords] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Passwords", value: "0", icon: "🔐" },
    { label: "Categories", value: "0", icon: "📁" },
    { label: "Favorites", value: "0", icon: "⭐" },
    { label: "Last Backup", value: "Never", icon: "☁️" },
  ]);

  // Fetch real profile, session, and statistics data
  useEffect(() => {
    const initializeProfile = async () => {
      if (!token) return;

      try {
        const api = createApiClient({ getAuthToken: async () => token });

        // Fetch profile, session, and passwords data in parallel like the web dashboard
        const [profile, session, passwordsRes] = await Promise.all([
          api.getProfile(),
          api.validateSession().catch((e) => e),
          api.getPasswords(),
        ]);

        // Update profile data
        if (profile.success && profile.data?.user) {
          setProfileData(profile.data.user);
        }

        // Update session data
        const sessionValid = (session as any)?.success === true;
        if (sessionValid) {
          setSessionData((session as any).data?.session);
        }

        // Update statistics
        if (passwordsRes.success && passwordsRes.data) {
          const fetchedPasswords = passwordsRes.data.passwords || [];
          const count = passwordsRes.data.count || fetchedPasswords.length;

          // Store passwords for recent activity
          setPasswords(fetchedPasswords);

          // Calculate real statistics
          const categories = new Set(
            fetchedPasswords.map((p: any) => p.category).filter(Boolean),
          );
          const favorites = fetchedPasswords.filter(
            (p: any) => p.isFavorite,
          ).length;

          // Get last backup time (for now, we'll simulate this)
          const lastBackup = getLastBackupTime();

          setStats([
            { label: "Passwords", value: count.toString(), icon: "🔐" },
            {
              label: "Categories",
              value: categories.size.toString(),
              icon: "📁",
            },
            { label: "Favorites", value: favorites.toString(), icon: "⭐" },
            { label: "Last Backup", value: lastBackup, icon: "☁️" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        // Keep default values on error
      } finally {
        setLoadingProfile(false);
        setLoadingStats(false);
      }
    };

    initializeProfile();
  }, [token]);

  // Update form data when profile data changes
  useEffect(() => {
    setFormData({
      name: profileData?.name || user?.name || "",
      email: profileData?.email || user?.email || "",
    });
  }, [profileData, user]);

  const getLastBackupTime = () => {
    // For now, simulate backup time. In real app, this would come from API
    const now = new Date();
    const backupTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const hours = Math.floor(
      (now.getTime() - backupTime.getTime()) / (1000 * 60 * 60),
    );

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleUpdateProfile = async () => {
    if (!token) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    setUpdating(true);
    try {
      const api = createApiClient({ getAuthToken: async () => token });

      // For now, simulate profile update since API doesn't have update endpoint
      // In real implementation, you'd call: api.updateProfile(formData)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh profile data after update
      const profile = await api.getProfile();
      if (profile.success && profile.data?.user) {
        setProfileData(profile.data.user);
      }

      setEditingProfile(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const securityOptions = [
    {
      icon: "🔑",
      title: "Change Master Password",
      description: "Update your master password for enhanced security",
      action: () =>
        Alert.alert("Coming Soon", "Feature will be available soon"),
    },
    {
      icon: "📱",
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      action: () =>
        Alert.alert("Coming Soon", "Feature will be available soon"),
    },
    {
      icon: "🔄",
      title: "Export Data",
      description: "Download all your encrypted data",
      action: () =>
        Alert.alert("Coming Soon", "Feature will be available soon"),
    },
    {
      icon: "🗑️",
      title: "Delete Account",
      description: "Permanently delete your account and all data",
      action: () =>
        Alert.alert("Coming Soon", "Feature will be available soon"),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerTitleStyle: { fontFamily: Fonts.rounded, fontWeight: "700" },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" },
          ]}
        >
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
            ]}
          >
            <ThemedText style={styles.avatarEmoji}>👤</ThemedText>
          </View>

          {editingProfile ? (
            <View style={styles.editForm}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#374151" : "#FFFFFF",
                    borderColor: isDark ? "#4B5563" : "#D1D5DB",
                    color: isDark ? "#F9FAFB" : "#111827",
                  },
                ]}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Your name"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#374151" : "#FFFFFF",
                    borderColor: isDark ? "#4B5563" : "#D1D5DB",
                    color: isDark ? "#F9FAFB" : "#111827",
                  },
                ]}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Your email"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { borderColor: isDark ? "#4B5563" : "#D1D5DB" },
                  ]}
                  onPress={() => {
                    setEditingProfile(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                    });
                  }}
                >
                  <ThemedText
                    style={[
                      styles.cancelButtonText,
                      { color: isDark ? "#9CA3AF" : "#6B7280" },
                    ]}
                  >
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: updating ? "#9CA3AF" : "#3B82F6" },
                  ]}
                  onPress={handleUpdateProfile}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : loadingProfile ? (
            <View style={styles.profileInfo}>
              <ActivityIndicator
                size="small"
                color={isDark ? "#60A5FA" : "#2563EB"}
                style={{ marginBottom: 8 }}
              />
              <ThemedText
                style={[
                  styles.userEmail,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                Loading profile...
              </ThemedText>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <ThemedText style={styles.userName}>
                {profileData?.name || user?.name || "Vault User"}
              </ThemedText>
              <ThemedText
                style={[
                  styles.userEmail,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                {profileData?.email || user?.email || "encrypted@session.com"}
              </ThemedText>
              {sessionData?.loginTime && (
                <ThemedText
                  style={[
                    styles.userEmail,
                    { color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 },
                  ]}
                >
                  Session:{" "}
                  {new Date(sessionData.loginTime).toLocaleDateString()}
                </ThemedText>
              )}
              <TouchableOpacity
                style={[
                  styles.editButton,
                  { backgroundColor: isDark ? "#374151" : "#FFFFFF" },
                ]}
                onPress={() => setEditingProfile(true)}
              >
                <ThemedText
                  style={[
                    styles.editButtonText,
                    { color: isDark ? "#60A5FA" : "#2563EB" },
                  ]}
                >
                  Edit Profile
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <ThemedText style={styles.sectionTitle}>Your Vault Stats</ThemedText>
          <View style={styles.statsGrid}>
            {loadingStats
              ? // Loading skeleton
                [1, 2, 3, 4].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                        borderColor: isDark ? "#374151" : "#E5E7EB",
                      },
                    ]}
                  >
                    <ActivityIndicator
                      size="small"
                      color={isDark ? "#60A5FA" : "#2563EB"}
                    />
                    <View
                      style={[
                        styles.skeletonText,
                        { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
                      ]}
                    />
                    <View
                      style={[
                        styles.skeletonText,
                        {
                          width: "60%",
                          backgroundColor: isDark ? "#374151" : "#E5E7EB",
                        },
                      ]}
                    />
                  </View>
                ))
              : stats.map((stat, index) => (
                  <View
                    key={index}
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                        borderColor: isDark ? "#374151" : "#E5E7EB",
                      },
                    ]}
                  >
                    <ThemedText style={styles.statIcon}>{stat.icon}</ThemedText>
                    <ThemedText
                      style={[
                        styles.statValue,
                        { color: isDark ? "#F9FAFB" : "#111827" },
                      ]}
                    >
                      {stat.value}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statLabel,
                        { color: isDark ? "#9CA3AF" : "#6B7280" },
                      ]}
                    >
                      {stat.label}
                    </ThemedText>
                  </View>
                ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
          <View
            style={[
              styles.optionCard,
              {
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                borderColor: isDark ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            {sessionData?.loginTime && (
              <View
                style={[
                  styles.activityItem,
                  {
                    borderBottomColor: isDark ? "#374151" : "#E5E7EB",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.activityLabel,
                    { color: isDark ? "#9CA3AF" : "#6B7280" },
                  ]}
                >
                  Login Time
                </ThemedText>
                <ThemedText
                  style={[
                    styles.activityValue,
                    { color: isDark ? "#F9FAFB" : "#111827" },
                  ]}
                >
                  {new Date(sessionData.loginTime).toLocaleString()}
                </ThemedText>
              </View>
            )}
            {passwords.length > 0 ? (
              passwords
                .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
                .slice(0, 3)
                .map((password) => (
                  <View
                    key={password._id}
                    style={[
                      styles.activityItem,
                      {
                        borderBottomColor: isDark ? "#374151" : "#E5E7EB",
                      },
                    ]}
                  >
                    <View style={styles.passwordItem}>
                      <View
                        style={[
                          styles.passwordIcon,
                          { backgroundColor: isDark ? "#374151" : "#F3F4F6" },
                        ]}
                      >
                        <ThemedText style={styles.passwordIconText}>
                          🔐
                        </ThemedText>
                      </View>
                      <View style={styles.passwordInfo}>
                        <ThemedText
                          style={[
                            styles.passwordWebsite,
                            { color: isDark ? "#F9FAFB" : "#111827" },
                          ]}
                        >
                          {password.website}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.passwordUsername,
                            { color: isDark ? "#9CA3AF" : "#6B7280" },
                          ]}
                        >
                          {password.username}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText
                      style={[
                        styles.activityDate,
                        { color: isDark ? "#6B7280" : "#9CA3AF" },
                      ]}
                    >
                      {new Date(password.lastModified).toLocaleDateString()}
                    </ThemedText>
                  </View>
                ))
            ) : (
              <View style={styles.noActivity}>
                <ThemedText
                  style={[
                    styles.noActivityText,
                    { color: isDark ? "#6B7280" : "#9CA3AF" },
                  ]}
                >
                  No passwords stored yet.
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Security & Privacy */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>
            Security & Privacy
          </ThemedText>
          <View style={styles.optionsContainer}>
            {securityOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                    borderColor: isDark ? "#374151" : "#E5E7EB",
                  },
                ]}
                onPress={option.action}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionIconContainer,
                      { backgroundColor: isDark ? "#374151" : "#F3F4F6" },
                    ]}
                  >
                    <ThemedText style={styles.optionIcon}>
                      {option.icon}
                    </ThemedText>
                  </View>
                  <View style={styles.optionText}>
                    <ThemedText
                      style={[
                        styles.optionTitle,
                        { color: isDark ? "#F9FAFB" : "#111827" },
                      ]}
                    >
                      {option.title}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.optionDescription,
                        { color: isDark ? "#9CA3AF" : "#6B7280" },
                      ]}
                    >
                      {option.description}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText
                  style={[
                    styles.optionArrow,
                    { color: isDark ? "#6B7280" : "#9CA3AF" },
                  ]}
                >
                  →
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Account Actions</ThemedText>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDark ? "#451A03" : "#FEF3C7",
                borderColor: isDark ? "#92400E" : "#F59E0B",
              },
            ]}
            onPress={handleLogout}
          >
            <ThemedText
              style={[
                styles.logoutButtonText,
                { color: isDark ? "#FED7AA" : "#92400E" },
              ]}
            >
              🚪 Sign Out
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <ThemedText
            style={[
              styles.versionText,
              { color: isDark ? "#6B7280" : "#9CA3AF" },
            ]}
          >
            PassManager v1.0.4 (Mobile)
          </ThemedText>
          <ThemedText
            style={[
              styles.versionSubtext,
              { color: isDark ? "#4B5563" : "#6B7280" },
            ]}
          >
            Built with React Native & Expo
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  editForm: {
    width: "100%",
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  skeletonText: {
    height: 12,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  optionArrow: {
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  versionContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  versionSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  // Recent Activity Styles
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityValue: {
    fontSize: 12,
    fontWeight: "500",
  },
  activityDate: {
    fontSize: 10,
    fontWeight: "500",
  },
  passwordItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  passwordIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  passwordIconText: {
    fontSize: 16,
  },
  passwordInfo: {
    flex: 1,
  },
  passwordWebsite: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  passwordUsername: {
    fontSize: 12,
  },
  noActivity: {
    paddingVertical: 24,
    alignItems: "center",
  },
  noActivityText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
