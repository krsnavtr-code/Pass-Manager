import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  
} from "react-native";
import React, { useState } from "react";

import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

export default function TabTwoScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const faqCategories = [
    {
      title: "Getting Started",
      icon: "",
      color: "#3B82F6",
      questions: [
        {
          q: "How do I create my first password entry?",
          a: "Tap the '+' button in the vault, fill in the website details, username, password, and your master password for encryption, then tap 'Encrypt & Save'.",
        },
        {
          q: "What is a master password and why do I need it?",
          a: "The master password is used to encrypt and decrypt all your stored passwords. It's never stored on our servers - only you know it. Make sure it's strong and memorable.",
        },
        {
          q: "How do I import existing passwords?",
          a: "Go to Settings > Import/Export to import passwords from CSV files or other password managers. We support imports from 1Password, LastPass, and more.",
        },
      ],
    },
    {
      title: "Security & Privacy",
      icon: "",
      color: "#10B981",
      questions: [
        {
          q: "How are my passwords stored?",
          a: "All passwords are encrypted on your device using AES-256 encryption before being sent to our servers. We never have access to your unencrypted passwords.",
        },
        {
          q: "Is my data backed up automatically?",
          a: "Yes, your encrypted data is backed up securely. You can also create manual backups in Settings > Backup.",
        },
        {
          q: "What happens if I forget my master password?",
          a: "Unfortunately, we cannot recover your master password as it's never stored. You'll need to reset your account and start over. Always keep a secure backup of your master password.",
        },
      ],
    },
    {
      title: "Features & Usage",
      icon: "",
      color: "#8B5CF6",
      questions: [
        {
          q: "How do favorites work?",
          a: "Tap the star icon on any password entry to mark it as a favorite. You can then filter to show only favorites for quick access.",
        },
        {
          q: "Can I organize passwords by categories?",
          a: "Yes! You can assign categories like Social, Work, Finance, Shopping, or Other to each password. Use the category filter to organize your vault.",
        },
        {
          q: "How do I share passwords with others?",
          a: "Currently, passwords are private to your account. We're working on a secure sharing feature that will be available soon.",
        },
      ],
    },
    {
      title: "Troubleshooting",
      icon: "",
      color: "#F59E0B",
      questions: [
        {
          q: "Why can't I see my passwords?",
          a: "Make sure you're logged in and have entered your master password when prompted. Check your internet connection and try refreshing.",
        },
        {
          q: "Password decryption is failing",
          a: "Ensure you're entering the correct master password. Double-check for typos and that you're using the same password you used for encryption.",
        },
        {
          q: "The app is running slowly",
          a: "Try clearing the app cache, restarting the app, or checking your internet connection. Make sure you have a stable connection.",
        },
      ],
    },
  ];

  const supportOptions = [
    {
      icon: "",
      title: "Email Support",
      description: "Get help via email within 24 hours",
      action: "support@passmanager.com",
      color: "#3B82F6",
    },
    {
      icon: "",
      title: "Live Chat",
      description: "Chat with our support team instantly",
      action: "Start Chat",
      color: "#10B981",
    },
    {
      icon: "",
      title: "Documentation",
      description: "Browse our comprehensive guides",
      action: "View Docs",
      color: "#8B5CF6",
    },
  ];

  const handleSubmitSupport = async () => {
    if (!supportEmail.trim() || !supportMessage.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset form
    setSupportMessage("");
    setSupportEmail("");
    setSubmitting(false);

    Alert.alert(
      "Success",
      "Support request sent successfully! We'll get back to you soon.",
    );
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E0E7FF", dark: "#1E1B4B" }}
      headerImage={
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerEmoji}>🛡️</ThemedText>
        </View>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            fontSize: 32,
          }}
        >
          Security Guide
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.introText}>
        Learn how to maximize your digital safety with PassManager's advanced
        encryption features.
      </ThemedText>

      <Collapsible title="🔐 Your Master Password">
        <ThemedText>
          Your <ThemedText type="defaultSemiBold">Master Password</ThemedText>{" "}
          is the only key to your vault. We use{" "}
          <ThemedText type="defaultSemiBold">AES-256 bit encryption</ThemedText>{" "}
          to ensure that even we cannot see your data.
        </ThemedText>
        <ThemedView
          style={[
            styles.warningBox,
            { backgroundColor: isDark ? "#312E81" : "#EEF2FF" },
          ]}
        >
          <ThemedText style={styles.warningText}>
            ⚠️ If you lose your Master Password, your data cannot be recovered.
            Keep it in a safe place.
          </ThemedText>
        </ThemedView>
      </Collapsible>

      <Collapsible title="📁 Organizing your Vault">
        <ThemedText>
          Use <ThemedText type="defaultSemiBold">Categories</ThemedText> like
          Work, Social, and Finance to keep your credentials organized. You can
          also mark important entries as
          <ThemedText type="defaultSemiBold"> Favorites</ThemedText> for quick
          access from the dashboard.
        </ThemedText>
      </Collapsible>

      <Collapsible title="☁️ Backup & Sync">
        <ThemedText>
          Your vault is automatically synced across your devices. To manually
          trigger a backup or export your data, visit the{" "}
          <ThemedText type="defaultSemiBold">Settings</ThemedText> tab.
        </ThemedText>
        <ExternalLink href="https://your-docs-link.com/backup">
          <ThemedText type="link" style={styles.learnMore}>
            Learn about our sync protocol
          </ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="🌓 Display Preferences">
        <ThemedText>
          PassManager supports both Light and Dark modes. The app will
          automatically follow your system settings, but you can override this
          in the
          <ThemedText type="defaultSemiBold"> Security tab</ThemedText>.
        </ThemedText>
      </Collapsible>

      <Collapsible title="🛠️ App Versions">
        <ThemedText>
          Current Version:{" "}
          <ThemedText type="defaultSemiBold">v1.0.4 (Stable)</ThemedText>
        </ThemedText>
        <ThemedText style={styles.footerInfo}>
          Developed with React Native & Expo for Android, iOS, and Web support.
        </ThemedText>
      </Collapsible>

      {/* Help & Support Section */}
      <View
        style={[
          styles.sectionContainer,
          { backgroundColor: isDark ? "#1F2937" : "#F9FAFB" },
        ]}
      >
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionIcon}>❓</ThemedText>
          <ThemedText style={styles.sectionTitle}>Help & Support</ThemedText>
        </View>
        <ThemedText style={styles.sectionSubtitle}>
          Get answers to your questions and find the help you need
        </ThemedText>
      </View>

      {/* Quick Support Options */}
      <View style={styles.supportOptionsContainer}>
        {supportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.supportOption,
              {
                backgroundColor: isDark ? "#374151" : "#FFFFFF",
                borderColor: isDark ? "#4B5563" : "#E5E7EB",
              },
            ]}
            onPress={() => {
              if (option.title === "Email Support") {
                Alert.alert(
                  "Email Support",
                  "Contact us at: support@passmanager.com",
                );
              } else if (option.title === "Live Chat") {
                Alert.alert("Live Chat", "Chat feature coming soon!");
              } else {
                Alert.alert("Documentation", "Opening documentation...");
              }
            }}
          >
            <View
              style={[
                styles.supportIconContainer,
                { backgroundColor: option.color + "20" },
              ]}
            >
              <ThemedText style={styles.supportIcon}>{option.icon}</ThemedText>
            </View>
            <ThemedText style={styles.supportTitle}>{option.title}</ThemedText>
            <ThemedText
              style={[
                styles.supportDescription,
                { color: isDark ? "#9CA3AF" : "#6B7280" },
              ]}
            >
              {option.description}
            </ThemedText>
            <ThemedText style={[styles.supportAction, { color: option.color }]}>
              {option.action} →
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ Section */}
      <View
        style={[
          styles.faqContainer,
          {
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            borderColor: isDark ? "#374151" : "#E5E7EB",
          },
        ]}
      >
        <ThemedText style={styles.faqTitle}>
          Frequently Asked Questions
        </ThemedText>

        {faqCategories.map((category, catIndex) => (
          <View key={catIndex} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.categoryIconContainer,
                  { backgroundColor: category.color + "20" },
                ]}
              >
                <ThemedText style={styles.categoryIcon}>
                  {category.icon}
                </ThemedText>
              </View>
              <ThemedText style={styles.categoryTitle}>
                {category.title}
              </ThemedText>
            </View>

            {category.questions.map((faq, faqIndex) => {
              const currentIndex = catIndex * 100 + faqIndex;
              return (
                <View
                  key={faqIndex}
                  style={[
                    styles.faqItem,
                    { borderColor: isDark ? "#374151" : "#E5E7EB" },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleFaq(currentIndex)}
                  >
                    <ThemedText
                      style={[
                        styles.faqQuestionText,
                        { color: isDark ? "#F9FAFB" : "#111827" },
                      ]}
                    >
                      {faq.q}
                    </ThemedText>
                    <ThemedText style={styles.expandIcon}>
                      {expandedFaq === currentIndex ? "−" : "+"}
                    </ThemedText>
                  </TouchableOpacity>
                  {expandedFaq === currentIndex && (
                    <View
                      style={[
                        styles.faqAnswer,
                        { backgroundColor: isDark ? "#374151" : "#F9FAFB" },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.faqAnswerText,
                          { color: isDark ? "#D1D5DB" : "#4B5563" },
                        ]}
                      >
                        {faq.a}
                      </ThemedText>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Contact Support Form */}
      <View
        style={[
          styles.contactContainer,
          {
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            borderColor: isDark ? "#374151" : "#E5E7EB",
          },
        ]}
      >
        <ThemedText style={styles.contactTitle}>Contact Support</ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? "#374151" : "#F9FAFB",
                borderColor: isDark ? "#4B5563" : "#D1D5DB",
                color: isDark ? "#F9FAFB" : "#111827",
              },
            ]}
            value={supportEmail}
            onChangeText={setSupportEmail}
            placeholder="your@email.com"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Message</ThemedText>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              {
                backgroundColor: isDark ? "#374151" : "#F9FAFB",
                borderColor: isDark ? "#4B5563" : "#D1D5DB",
                color: isDark ? "#F9FAFB" : "#111827",
              },
            ]}
            value={supportMessage}
            onChangeText={setSupportMessage}
            placeholder="Describe your issue or question in detail..."
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: submitting ? "#9CA3AF" : "#3B82F6" },
          ]}
          onPress={handleSubmitSupport}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              Send Message
            </ThemedText>
          )}
        </TouchableOpacity>

        <ThemedText
          style={[
            styles.responseTime,
            { color: isDark ? "#9CA3AF" : "#6B7280" },
          ]}
        >
          Typical response time: 2-4 hours
        </ThemedText>
      </View>

      {/* Emergency Contact */}
      <View
        style={[
          styles.emergencyContainer,
          {
            backgroundColor: isDark ? "#451A03" : "#FEF3C7",
            borderColor: isDark ? "#92400E" : "#F59E0B",
          },
        ]}
      >
        <View style={styles.emergencyHeader}>
          <ThemedText style={styles.emergencyIcon}>⚠️</ThemedText>
          <ThemedText
            style={[
              styles.emergencyTitle,
              { color: isDark ? "#FED7AA" : "#92400E" },
            ]}
          >
            Emergency Support
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.emergencyDescription,
            { color: isDark ? "#FED7AA" : "#78350F" },
          ]}
        >
          For security emergencies or account lockouts, contact our emergency
          support:
        </ThemedText>
        <TouchableOpacity style={styles.emergencyButton}>
          <ThemedText
            style={[
              styles.emergencyButtonText,
              { color: isDark ? "#FED7AA" : "#92400E" },
            ]}
          >
             Email: trivixampps@gmail.com
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emergencyButton}>
          <ThemedText
            style={[
              styles.emergencyButtonText,
              { color: isDark ? "#FED7AA" : "#92400E" },
            ]}
          >
            📞 +91 9084407615
          </ThemedText>
        </TouchableOpacity>
        <ThemedText
          style={[
            styles.emergencyAvailability,
            { color: isDark ? "#FED7AA" : "#78350F" },
          ]}
        >
          24/7 Available
        </ThemedText>
      </View>

      <View style={styles.spacing} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 120,
    bottom: -20,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 20,
  },
  warningBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  warningText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  learnMore: {
    marginTop: 8,
    fontWeight: "700",
  },
  footerInfo: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 10,
  },
  spacing: {
    height: 100, // Extra padding for the floating footer
  },
  // Help & Support Styles
  sectionContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 36,
  },
  supportOptionsContainer: {
    marginBottom: 24,
  },
  supportOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  supportIcon: {
    fontSize: 20,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  supportAction: {
    fontSize: 13,
    fontWeight: "600",
  },
  faqContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  faqItem: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: "600",
  },
  faqAnswer: {
    padding: 16,
    borderTopWidth: 1,
  },
  faqAnswerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  contactContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  responseTime: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  emergencyContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emergencyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emergencyDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  emergencyButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emergencyAvailability: {
    fontSize: 11,
    fontStyle: "italic",
  },
});
