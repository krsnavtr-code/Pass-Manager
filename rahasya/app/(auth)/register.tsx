import { Link, Redirect } from "expo-router";
import React, { useMemo, useState } from "react";
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

export default function RegisterScreen() {
  const { isLoading, token, signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      masterPassword.length > 0,
    [name, email, password, confirmPassword, masterPassword],
  );

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

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        masterPassword,
      });
    } catch (e: any) {
      Alert.alert("Registration failed", e?.message || "Please try again");
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <ThemedText style={styles.logoIcon}>🛡️</ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Start securing your digital life
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Name Input */}
            <ThemedText style={styles.label}>Full Name</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.fieldIcon}>👤</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                placeholderTextColor="#999"
                style={styles.input}
              />
            </View>

            {/* Email Input */}
            <ThemedText style={styles.label}>Email Address</ThemedText>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.fieldIcon}>📧</ThemedText>
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

            {/* Password Row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.fieldIcon}>🔒</ThemedText>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="•••••"
                    placeholderTextColor="#999"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <ThemedText style={styles.label}>Confirm</ThemedText>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.fieldIcon}>✅</ThemedText>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="•••••"
                    placeholderTextColor="#999"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {/* Master Password Section - Highlighted for Security Importance */}
            <View style={styles.masterSection}>
              <View style={styles.masterHeader}>
                <ThemedText style={styles.fieldIcon}>🔑</ThemedText>
                <ThemedText style={styles.masterLabel}>
                  Master Password
                </ThemedText>
              </View>
              <TextInput
                value={masterPassword}
                onChangeText={setMasterPassword}
                secureTextEntry
                placeholder="The key to your vault"
                placeholderTextColor="#999"
                style={styles.masterInput}
              />
              <ThemedText style={styles.infoText}>
                ⚠️ This password encrypts your data. If lost, it cannot be
                recovered.
              </ThemedText>
            </View>

            {/* Register Button */}
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
                <ThemedText style={styles.buttonText}>
                  Create Secure Account
                </ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Already a member?{" "}
              </ThemedText>
              <Link href="/(auth)/login">
                <ThemedText type="link" style={styles.linkText}>
                  Sign in
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
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 32, marginTop: 20 },
  logoBadge: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoIcon: { fontSize: 28 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#666", fontSize: 15 },
  form: { width: "100%" },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  fieldIcon: { marginRight: 8, fontSize: 16 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#000" },
  row: { flexDirection: "row", width: "100%" },
  masterSection: {
    backgroundColor: "#F0F7FF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D0E7FF",
    marginBottom: 20,
  },
  masterHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  masterLabel: {
    fontWeight: "700",
    color: "#0056B3",
    fontSize: 13,
    textTransform: "uppercase",
  },
  masterInput: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#B0D7FF",
  },
  infoText: { fontSize: 10, color: "#0056B3", marginTop: 8, fontWeight: "600" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: { backgroundColor: "#A0CFFF", elevation: 0 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#666" },
  linkText: { fontWeight: "700", color: "#007AFF" },
});
