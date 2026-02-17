import React, { useMemo, useState } from "react";
import { Link, Redirect } from "expo-router";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { isLoading, token, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  // Essential for preventing the "flash" of login screen on reload
  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  async function onSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Section */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <ThemedText style={styles.logoIcon}>🛡️</ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>
              Rahasya
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Your secure vault
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Email Input */}
            <ThemedText style={styles.label}>Email Address</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputIcon}>📧</ThemedText>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="#999"
                style={styles.input}
              />
            </View>

            {/* Password Input */}
            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputIcon}>🔒</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="•••••"
                placeholderTextColor="#999"
                style={styles.input}
              />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={onSubmit}
              disabled={!canSubmit || submitting}
              activeOpacity={0.8}
              style={[
                styles.button,
                (!canSubmit || submitting) && styles.buttonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.buttonText}>Sign In</ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Don't have an account?{" "}
              </ThemedText>
              <Link href="/(auth)/register">
                <ThemedText type="link" style={styles.linkText}>
                  Create one
                </ThemedText>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  logoBadge: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  logoIcon: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#666", fontSize: 16 },
  form: { width: "100%" },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: { backgroundColor: "#A0CFFF", elevation: 0 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#666" },
  linkText: { fontWeight: "700", color: "#007AFF" },
});
