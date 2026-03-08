"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  FileText,
  Shield,
  Key,
  Lock,
  Database,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Send,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { apiClient, User } from "../../../lib/api";

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Master password reset states
  const [resetOTP, setResetOTP] = useState("");
  const [newMasterPassword, setNewMasterPassword] = useState("");
  const [confirmMasterPassword, setConfirmMasterPassword] = useState("");
  const [resetStep, setResetStep] = useState<"idle" | "otp-sent" | "verified">(
    "idle",
  );
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Get user profile on component mount
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await apiClient.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to get user profile:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    getUserProfile();
  }, []);

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Info,
      color: "blue",
      questions: [
        {
          q: "How do I create my first password entry?",
          a: "Click the '+' button in the vault, fill in the website details, username, password, and your master password for encryption, then click 'Encrypt & Save'.",
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
      icon: Shield,
      color: "emerald",
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
      icon: Key,
      color: "purple",
      questions: [
        {
          q: "How do favorites work?",
          a: "Click the star icon on any password entry to mark it as a favorite. You can then filter to show only favorites for quick access.",
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
      icon: AlertCircle,
      color: "amber",
      questions: [
        {
          q: "Why can't I see my passwords?",
          a: "Make sure you're logged in and have entered your master password when prompted. Check your internet connection and try refreshing the page.",
        },
        {
          q: "Password decryption is failing",
          a: "Ensure you're entering the correct master password. Double-check for typos and that you're using the same password you used for encryption.",
        },
        {
          q: "The app is running slowly",
          a: "Try clearing your browser cache, disabling browser extensions, or using a different browser. Make sure you have a stable internet connection.",
        },
      ],
    },
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      action: "support@passmanager.com",
      color: "blue",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team instantly",
      action: "Start Chat",
      color: "green",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Browse our comprehensive guides",
      action: "View Docs",
      color: "purple",
    },
  ];

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset form
    setSupportMessage("");
    setSupportEmail("");
    setSubmitting(false);

    // Show success message (in real app, you'd use a toast/notification)
    alert("Support request sent successfully! We'll get back to you soon.");
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetSubmitting(true);

    if (!user?.email) {
      setResetError("User email not found. Please log out and log back in.");
      setResetSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/reset-master-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setResetStep("otp-sent");
        setResetSuccess("OTP sent to your email. Please check your inbox.");
      } else {
        setResetError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      setResetError("Network error. Please try again.");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!user?.email) {
      setResetError("User email not found. Please log out and log back in.");
      return;
    }

    if (newMasterPassword !== confirmMasterPassword) {
      setResetError("Master passwords do not match");
      return;
    }

    if (newMasterPassword.length < 6) {
      setResetError("Master password must be at least 6 characters long");
      return;
    }

    setResetSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/reset-master-verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            otp: resetOTP,
            newMasterPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setResetStep("verified");
        setResetSuccess(
          "Master password reset successfully! You can now log in with your new password.",
        );
        // Reset form
        setResetOTP("");
        setNewMasterPassword("");
        setConfirmMasterPassword("");
      } else {
        setResetError(data.message || "Failed to reset password");
      }
    } catch (error) {
      setResetError("Network error. Please try again.");
    } finally {
      setResetSubmitting(false);
    }
  };

  const resetMasterPasswordForm = () => {
    if (loadingUser) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-red-700">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Lock className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-4">
              Reset Master Password
            </h3>

            {resetStep === "idle" && (
              <div className="space-y-4">
                <div className="bg-white border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      Email Address
                    </span>
                  </div>
                  <p className="text-red-600 font-medium">
                    {user?.email || "Not available"}
                  </p>
                  <p className="text-red-500 text-xs mt-1">
                    OTP will be sent to this email address
                  </p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <button
                    type="submit"
                    disabled={resetSubmitting || !user?.email}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {resetSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reset OTP
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {resetStep === "otp-sent" && (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                  <p className="text-blue-700 text-sm">
                    OTP sent to <strong>{user?.email}</strong>. Please check
                    your email and enter the 6-digit code below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={resetOTP}
                    onChange={(e) =>
                      setResetOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-center text-lg font-mono"
                    placeholder="000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    value={newMasterPassword}
                    onChange={(e) => setNewMasterPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    placeholder="Enter new master password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Confirm New Master Password
                  </label>
                  <input
                    type="password"
                    value={confirmMasterPassword}
                    onChange={(e) => setConfirmMasterPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    placeholder="Confirm new master password"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {resetSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Reset Password
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setResetStep("idle")}
                    className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {resetStep === "verified" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-900">
                    Reset Successful!
                  </h4>
                </div>
                <p className="text-green-700 text-sm mb-4">
                  Your master password has been reset successfully. You can now
                  log in with your new password.
                </p>
                <button
                  onClick={() => setResetStep("idle")}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {resetError && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-3 mt-4">
                <p className="text-red-700 text-sm">{resetError}</p>
              </div>
            )}

            {resetSuccess && resetStep !== "verified" && (
              <div className="bg-green-100 border border-green-300 rounded-xl p-3 mt-4">
                <p className="text-green-700 text-sm">{resetSuccess}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Help & Support
              </h1>
              <p className="text-slate-500">
                Get answers to your questions and find the help you need
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 bg-${option.color}-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-6 h-6 text-${option.color}-600`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  {option.description}
                </p>
                <button
                  className={`text-${option.color}-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}
                >
                  {option.action}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqCategories.map((category, catIndex) => {
              const Icon = category.icon;
              return (
                <div key={catIndex}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 bg-${category.color}-50 rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 text-${category.color}-600`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {category.title}
                    </h3>
                  </div>

                  <div className="space-y-3 ml-13">
                    {category.questions.map((faq, faqIndex) => (
                      <div
                        key={faqIndex}
                        className="border border-slate-100 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedFaq(
                              expandedFaq === catIndex * 100 + faqIndex
                                ? null
                                : catIndex * 100 + faqIndex,
                            )
                          }
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-medium text-slate-700">
                            {faq.q}
                          </span>
                          {expandedFaq === catIndex * 100 + faqIndex ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        {expandedFaq === catIndex * 100 + faqIndex && (
                          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                            <p className="text-slate-600 text-sm">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Contact Support
          </h2>

          <form onSubmit={handleSubmitSupport} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                  <option>Low - General Question</option>
                  <option>Medium - Account Issue</option>
                  <option>High - Security Concern</option>
                  <option>Critical - Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Describe your issue or question in detail..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Typical response time: 2-4 hours</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">
                Emergency Support
              </h3>
              <p className="text-amber-700 text-sm mb-3">
                For security emergencies or account lockouts, contact our
                emergency support line:
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="tel:+1-800-EMERGENCY"
                  className="flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
                >
                  <Phone className="w-4 h-4" />
                  1-800-EMERGENCY
                </a>
                <span className="text-amber-600 text-sm">24/7 Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Password Reset */}
        {resetMasterPasswordForm()}
      </div>
    </div>
  );
}
