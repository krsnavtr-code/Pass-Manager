"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Key,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FolderLock,
  Loader2,
  KeyRound,
} from "lucide-react";
import apiClient from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState({
    loading: true,
    user: null as any,
    passwords: [] as any[],
    session: null as any,
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      // 1. Check token existence using apiClient.getToken() for better sync
      const token = apiClient.getToken();

      if (!token) {
        router.replace("/auth/login"); // Use replace to avoid back-button loops
        return;
      }

      try {
        // 2. Fetch data
        const [profile, pass, session] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getPasswords(),
          apiClient.validateSession().catch((e) => e),
        ]);

        // 3. Update state only if profile is successful
        if (profile.success) {
          const sessionData =
            (session as any)?.success === true
              ? (session as any).data?.session
              : null;

          setData({
            loading: false,
            user: profile.data?.user,
            // Backend response structure check: some APIs return .passwords, some .data
            passwords: pass.success
              ? pass.data?.passwords || (pass as any).passwords || []
              : [],
            session: sessionData,
          });
        } else {
          // If profile fetch returns success: false, it's a soft logout
          throw new Error("Session invalid");
        }
      } catch (e: any) {
        // Session expiry should log out cleanly
        const isAuthError =
          e?.status === 401 ||
          e?.message?.includes("401") ||
          e?.message?.toLowerCase?.().includes("not authorized") ||
          e?.message?.toLowerCase?.().includes("session expired");

        if (isAuthError) {
          apiClient.clearToken();
          router.replace("/auth/login");
        } else {
          console.error("Dashboard fetch error:", e);
          // Server down ya network error par logout mat karo, bas loading stop karo
          setData((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    initializeDashboard();
  }, [router]);

  const stats = useMemo(() => {
    const { passwords } = data;
    const favs = passwords.filter((p) => p.isFavorite).length;
    const cats = [...new Set(passwords.map((p) => p.category))];
    const score = Math.max(
      40,
      100 -
        passwords.filter(
          (p) => new Date(p.lastModified) < new Date(Date.now() - 15778476000),
        ).length *
          5,
    );

    return [
      {
        label: "Stored Passwords",
        val: passwords.length,
        icon: Key,
        color: "text-blue-600",
        bg: "bg-blue-50",
        trend: `${favs} favorites`,
      },
      {
        label: "Security Score",
        val: `${score}%`,
        icon: ShieldCheck,
        color: score > 70 ? "text-emerald-600" : "text-amber-600",
        bg: score > 70 ? "bg-emerald-50" : "bg-amber-50",
        trend: score > 70 ? "Excellent" : "Review needed",
      },
      {
        label: "Vault Categories",
        val: cats.length,
        icon: FolderLock,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        trend: cats.slice(0, 2).join(", ") || "None",
      },
    ];
  }, [data.passwords]);

  if (data.loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-2" /> Loading...
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome,{" "}
            <span className="text-blue-600">{data.user?.name || "User"}</span>
          </h1>
          <p className="text-slate-500">
            Your digital vault is secured and up to date.
          </p>
        </div>
        <Link
          href="/dashboard/vault"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
        >
          <KeyRound size={20} /> Vault
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm"
          >
            <div className="flex justify-between mb-4">
              <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>
                <s.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">
                Live
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{s.label}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900">{s.val}</p>
              <span className="text-xs font-medium text-blue-600">
                {s.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Recent Activity
            </h3>
            <button className="text-xs font-semibold text-blue-600">
              View all
            </button>
          </div>
          <div className="p-6 space-y-3">
            {data.session?.loginTime ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <p className="text-sm font-medium text-slate-700">Login Time</p>
                <p className="text-[11px] font-medium text-slate-500">
                  {new Date(data.session.loginTime).toLocaleString()}
                </p>
              </div>
            ) : null}
            {data.passwords.length ? (
              data.passwords
                .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
                .slice(0, 4)
                .map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Key size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {p.website}
                        </p>
                        <p className="text-xs text-slate-500">{p.username}</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400">
                      {new Date(p.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                ))
            ) : (
              <div className="text-center py-6 text-slate-400">
                No passwords stored yet.
              </div>
            )}
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Security Tips</h3>
          <div className="space-y-3 relative z-10">
            {(data.passwords.length
              ? [
                  "Regularly backup your vault",
                  "Use unique passwords",
                  "Organize categories",
                ]
              : ["Create master password", "Add first password", "Enable 2FA"]
            ).map((tip, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer group"
              >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="text-xs font-medium flex-1">{tip}</span>
                <ArrowUpRight
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-all"
                />
              </div>
            ))}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
        </section>
      </div>
    </div>
  );
}
