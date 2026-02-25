"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Shield,
  Mail,
  Bell,
  Database,
  Settings as SettingsIcon,
} from "lucide-react";
import apiClient from "@/lib/api";

interface AdminSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxPasswordLength: number;
  passwordComplexity: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  backupSettings: {
    enabled: boolean;
    frequency: string;
    retentionDays: number;
    autoBackup: boolean;
  };
  securitySettings: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireTwoFactor: boolean;
    ipWhitelist: string[];
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpFromEmail: string;
    smtpFromName: string;
    notificationSettings: {
      emailAlerts: boolean;
      securityAlerts: boolean;
      backupAlerts: boolean;
      systemAlerts: boolean;
    };
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Keep your mock settings data here...
      const mockSettings: AdminSettings = {
        siteName: "Rahasya Password Manager",
        siteDescription: "Secure password management system",
        allowRegistration: true,
        requireEmailVerification: false,
        sessionTimeout: 30,
        maxPasswordLength: 128,
        passwordComplexity: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
        },
        backupSettings: {
          enabled: true,
          frequency: "daily",
          retentionDays: 30,
          autoBackup: true,
        },
        securitySettings: {
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          requireTwoFactor: false,
          ipWhitelist: ["192.168.1.1"],
        },
        emailSettings: {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUser: "trivixamitsolution@gmail.com",
          smtpFromEmail: "noreply@rahasya.com",
          smtpFromName: "Rahasya Support",
          notificationSettings: {
            emailAlerts: true,
            securityAlerts: true,
            backupAlerts: true,
            systemAlerts: true,
          },
        },
      };
      setSettings(mockSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      alert("Settings saved successfully!");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K],
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  // Main UI Wrapper
  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {[
          { id: "general", label: "General", icon: SettingsIcon },
          { id: "security", label: "Security", icon: Shield },
          { id: "email", label: "Email", icon: Mail },
          { id: "notifications", label: "Alerts", icon: Bell },
          { id: "backup", label: "Backup", icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        {activeTab === "general" && (
          <div className="space-y-6">
            <SectionHeader
              title="System Configuration"
              description="Basic site details and registration rules."
            />
            <div className="grid gap-6">
              <TextInput
                label="Site Name"
                value={settings?.siteName}
                onChange={(v) => updateSetting("siteName", v)}
              />
              <div className="space-y-3">
                <Checkbox
                  id="reg"
                  label="Allow new registrations"
                  checked={settings?.allowRegistration}
                  onChange={(v: boolean) =>
                    updateSetting("allowRegistration", v)
                  }
                />
                <Checkbox
                  id="ver"
                  label="Require email verification"
                  checked={settings?.requireEmailVerification}
                  onChange={(v: boolean) =>
                    updateSetting("requireEmailVerification", v)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <SectionHeader
              title="Security & Auth"
              description="Password policies and login security."
            />
            <div className="grid md:grid-cols-2 gap-6">
              <NumberInput
                label="Max Password Length"
                value={settings?.maxPasswordLength}
                onChange={(v) => updateSetting("maxPasswordLength", v)}
              />
              <NumberInput
                label="Max Login Attempts"
                value={settings?.securitySettings?.maxLoginAttempts}
                onChange={(v) =>
                  updateSetting("securitySettings", {
                    maxLoginAttempts: v,
                    lockoutDuration:
                      settings?.securitySettings?.lockoutDuration || 15,
                    requireTwoFactor:
                      settings?.securitySettings?.requireTwoFactor || false,
                    ipWhitelist: settings?.securitySettings?.ipWhitelist || [],
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Restore your render logic for Email, Notifications, and Backup here inside similar wrapper divs */}
        {activeTab === "email" && (
          <div className="space-y-6">
            <SectionHeader
              title="SMTP Config"
              description="Setup your mail server."
            />
            {/* ... SMTP Inputs */}
          </div>
        )}

        {/* Floating Action Bar */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Sub-Components (Keep main page clean) ---

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
}

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
}

function TextInput({ label, value, onChange, type = "text" }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
      />
    </div>
  );
}

function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
      />
    </div>
  );
}

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean | undefined;
  onChange: (value: boolean) => void;
}

function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
      >
        {checked && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <input
        id={id}
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </label>
  );
}
