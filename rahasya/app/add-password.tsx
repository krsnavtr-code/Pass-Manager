import { Redirect, Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { createApiClient } from "@/lib/api";
import { Fonts, Colors } from "@/constants/theme";

export default function AddPasswordScreen() {
  const { token } = useAuth();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<"social" | "work" | "finance" | "shopping" | "other">("other");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => website.trim().length > 0 && username.trim().length > 0 && password.length > 0 && masterPassword.length > 0,
    [website, username, password, masterPassword]
  );

  if (!token) return <Redirect href="/(auth)/login" />;

  async function onSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const api = createApiClient({ getAuthToken: async () => token });
      const res = await api.createPassword({
        website: website.trim(),
        username: username.trim(),
        password,
        masterPassword,
        url: url.trim(),
        category,
        notes: notes.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter((t) => t !== ""),
        isFavorite: false,
      });

      if (!res.success) throw new Error(res.message || "Failed to create");
      Alert.alert("Success", "Credential added to your vault");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Please try again");
    } finally {
      setSubmitting(false);
    }
  }

  // Common input style logic
  const inputBg = isDark ? "#1E293B" : "#F8FAFC";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const placeholderColor = isDark ? "#64748B" : "#94A3B8";

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "New Credential", headerTitleStyle: { fontFamily: Fonts.rounded, fontWeight: "700" } }} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. Header Section */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE" }]}>
              <ThemedText style={styles.mainEmoji}>🔐</ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.title}>Secure Your Account</ThemedText>
            <View style={[styles.securityBadge, { backgroundColor: isDark ? "#064E3B" : "#D1FAE5" }]}>
              <ThemedText style={[styles.securityBadgeText, { color: isDark ? "#34D399" : "#065F46" }]}>
                AES-256 BIT ENCRYPTION
              </ThemedText>
            </View>
          </View>

          {/* 2. Primary Details Group */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderColor }]}>
             <ThemedText style={styles.sectionLabel}>Account Identity</ThemedText>
             
             <InputField label="Service Name" icon="🌐" value={website} onChangeText={setWebsite} placeholder="e.g. Netflix" isDark={isDark} />
             <InputField label="Username / Email" icon="👤" value={username} onChangeText={setUsername} placeholder="user@example.com" isDark={isDark} autoCapitalize="none" />
             <InputField label="Password" icon="🔑" value={password} onChangeText={setPassword} placeholder="••••••••" isDark={isDark} secureTextEntry />
          </View>

          {/* 3. Category Selector */}
          <ThemedText style={styles.label}>Classification</ThemedText>
          <View style={styles.categoryContainer}>
            {[
              { v: "social", l: "Social", i: "💬" },
              { v: "work", l: "Work", i: "💼" },
              { v: "finance", l: "Finance", i: "💰" },
              { v: "shopping", l: "Shop", i: "🛒" },
              { v: "other", l: "Other", i: "📁" },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.v}
                onPress={() => setCategory(cat.v as any)}
                style={[
                  styles.catBtn,
                  { backgroundColor: category === cat.v ? "#3B82F6" : inputBg, borderColor: category === cat.v ? "#3B82F6" : borderColor }
                ]}
              >
                <ThemedText style={styles.catIcon}>{cat.i}</ThemedText>
                <ThemedText style={[styles.catLabel, { color: category === cat.v ? "#FFF" : textColor }]}>{cat.l}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* 4. Metadata Group */}
          <View style={[styles.sectionCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderColor }]}>
             <ThemedText style={styles.sectionLabel}>Additional Info</ThemedText>
             <InputField label="Website URL" icon="🔗" value={url} onChangeText={setUrl} placeholder="https://..." isDark={isDark} />
             <InputField label="Tags" icon="🏷️" value={tags} onChangeText={setTags} placeholder="work, personal, travel" isDark={isDark} />
             <InputField label="Notes" icon="📝" value={notes} onChangeText={setNotes} placeholder="Security questions, etc." isDark={isDark} multiline />
          </View>

          {/* 5. Master Password Action - High Priority */}
          <View style={[styles.masterSection, { backgroundColor: isDark ? "#1E40AF" : "#EFF6FF", borderColor: "#3B82F6" }]}>
            <View style={styles.masterHeader}>
              <ThemedText style={styles.masterIcon}>🗝️</ThemedText>
              <ThemedText style={[styles.masterLabel, { color: isDark ? "#BFDBFE" : "#1E40AF" }]}>Verify Master Key</ThemedText>
            </View>
            <TextInput
              value={masterPassword}
              onChangeText={setMasterPassword}
              secureTextEntry
              placeholder="Confirm Master Password"
              placeholderTextColor={isDark ? "#93C5FD" : "#60A5FA"}
              style={[styles.masterInput, { color: isDark ? "#FFF" : "#000", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFF" }]}
            />
            <ThemedText style={[styles.infoText, { color: isDark ? "#DBEAFE" : "#1E40AF" }]}>
              This is required to encrypt your data before sync.
            </ThemedText>
          </View>

          {/* 6. Submit */}
          <TouchableOpacity
            onPress={onSubmit}
            disabled={!canSubmit || submitting}
            style={[styles.saveBtn, { backgroundColor: canSubmit ? "#3B82F6" : "#94A3B8" }]}
          >
            {submitting ? <ActivityIndicator color="white" /> : <ThemedText style={styles.saveBtnText}>Encrypt & Save to Vault</ThemedText>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// Helper Component for inputs
function InputField({ label, icon, isDark, ...props }: any) {
  return (
    <View style={styles.inputFieldWrapper}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <View style={[styles.inputContainer, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
        <ThemedText style={styles.fieldIcon}>{icon}</ThemedText>
        <TextInput 
          placeholderTextColor={isDark ? "#64748B" : "#94A3B8"} 
          style={[styles.input, { color: isDark ? "#F8FAFC" : "#0F172A" }]} 
          {...props} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { alignItems: "center", marginBottom: 25 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  mainEmoji: { fontSize: 30 },
  title: { fontWeight: "800", marginBottom: 8 },
  securityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  securityBadgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  
  sectionCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20, gap: 15 },
  sectionLabel: { fontSize: 12, fontWeight: "800", opacity: 0.4, textTransform: "uppercase", marginBottom: 5 },
  inputFieldWrapper: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  fieldIcon: { marginRight: 10, fontSize: 16 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15 },
  
  label: { fontSize: 13, fontWeight: "700", marginBottom: 10, marginLeft: 4 },
  categoryContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 25 },
  catBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 6 },
  catIcon: { fontSize: 14 },
  catLabel: { fontSize: 13, fontWeight: "700" },

  masterSection: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 30 },
  masterHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  masterIcon: { fontSize: 20, marginRight: 10 },
  masterLabel: { fontSize: 14, fontWeight: "800", textTransform: "uppercase" },
  masterInput: { borderRadius: 12, padding: 15, fontSize: 16, fontWeight: "600", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  infoText: { fontSize: 11, marginTop: 10, fontWeight: "500", opacity: 0.8 },

  saveBtn: { paddingVertical: 18, borderRadius: 18, alignItems: "center", shadowColor: "#3B82F6", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 }
});