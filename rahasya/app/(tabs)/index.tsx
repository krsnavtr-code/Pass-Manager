import { Redirect, useFocusEffect } from "expo-router";
import React, { useCallback, useState, useMemo } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { createApiClient } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { token, signOut } = useAuth();
  const { colorScheme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    loading: true,
    user: null as any,
    passwords: [] as any[],
    session: null as any,
  });

  const isDark = colorScheme === "dark";

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const api = createApiClient({ getAuthToken: async () => token });
      const [profile, pass, session] = await Promise.all([
        api.getProfile(),
        api.getPasswords(),
        api.validateSession().catch((e) => e),
      ]);

      if (profile.success) {
        setData({
          loading: false,
          user: profile.data?.user,
          passwords: pass.success ? pass.data?.passwords || [] : [],
          session: session?.success ? session.data?.session : null,
        });
      }
    } catch (e: any) {
       // Logic for Auth Error handling remains same
       if (e?.status === 401) await signOut();
       setData(prev => ({ ...prev, loading: false }));
    }
  }, [token, signOut]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const stats = useMemo(() => {
    const { passwords } = data;
    const favs = passwords.filter((p) => p.isFavorite).length;
    const cats = [...new Set(passwords.map((p) => p.category).filter(Boolean))];
    const score = Math.max(40, 100 - passwords.filter(p => 
      new Date(p.lastModified) < new Date(Date.now() - 15778476000)).length * 5);

    return [
      { label: "Vault", value: passwords.length, icon: "🔐", color: "#3B82F6", trend: `${favs} Favs` },
      { label: "Health", value: `${score}%`, icon: "🛡️", color: score > 70 ? "#10B981" : "#F59E0B", trend: score > 70 ? "Safe" : "Weak" },
      { label: "Folders", value: cats.length, icon: "📁", color: "#6366F1", trend: cats[0] || "None" },
    ];
  }, [data.passwords]);

  if (!token) return <Redirect href="/(auth)/login" />;

  if (data.loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="Vault Tracking" onMenuPress={() => setSidebarVisible(true)} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <ThemedText style={styles.greeting}>Hello, {data.user?.name || "User"} 👋</ThemedText>
          <ThemedText style={styles.subtitle}>Your security status is optimal.</ThemedText>
        </View>

        {/* Horizontal Stats for better mobile density */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
              <View style={[styles.iconWrapper, { backgroundColor: `${stat.color}15` }]}>
                <ThemedText style={styles.statEmoji}>{stat.icon}</ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              <ThemedText type="title" style={[styles.statValue, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statTrend, { color: stat.color }]}>{stat.trend}</ThemedText>
            </View>
          ))}
        </ScrollView>

        {/* Activity Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Activity</ThemedText>
        <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
          {data.passwords.length > 0 ? (
            data.passwords.slice(0, 3).map((item, idx) => (
              <TouchableOpacity key={item._id} style={[styles.activityRow, idx !== 2 && styles.borderBottom]}>
                <View style={styles.rowLeft}>
                  <View style={styles.keyIcon}><ThemedText>🔑</ThemedText></View>
                  <View>
                    <ThemedText style={styles.websiteText}>{item.website}</ThemedText>
                    <ThemedText style={styles.userText}>{item.username}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.dateText}>{new Date(item.lastModified).toLocaleDateString()}</ThemedText>
              </TouchableOpacity>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>No recent activity found.</ThemedText>
          )}
        </View>
      </ScrollView>

      <Sidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  welcomeContainer: { marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, opacity: 0.6 },
  
  // Stats
  statsScroll: { paddingRight: 20, gap: 15 },
  statCard: {
    width: width * 0.35,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  statEmoji: { fontSize: 20 },
  statLabel: { fontSize: 12, opacity: 0.6, fontWeight: "600", marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statTrend: { fontSize: 11, fontWeight: "700", marginTop: 4 },

  // List Cards
  sectionTitle: { marginTop: 30, marginBottom: 15, fontSize: 18, fontWeight: "700" },
  card: { borderRadius: 24, padding: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" },
  activityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  keyIcon: { width: 36, height: 36, backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  websiteText: { fontWeight: "700", fontSize: 15 },
  userText: { fontSize: 12, opacity: 0.5 },
  dateText: { fontSize: 11, opacity: 0.4 },
  emptyText: { textAlign: "center", padding: 20, opacity: 0.5 },

  // Tips
  tipsContainer: { gap: 10 },
  tipCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16 },
  tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563EB", marginRight: 12 },
  tipText: { flex: 1, fontWeight: "600", fontSize: 14 },
  arrow: { fontSize: 18, opacity: 0.3 },
});