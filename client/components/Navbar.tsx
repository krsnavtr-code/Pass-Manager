"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, ChevronDown, Clock } from "lucide-react";
import apiClient from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  const handleLogout = useCallback(() => {
    apiClient.clearToken();
    setUser(null);
    setTimeRemaining(0);
    router.push("/auth/login");
    setIsDropdownOpen(false);
  }, [router]);

  // Fetch user profile and session
  useEffect(() => {
    const fetchUserData = async () => {
      const token = apiClient.getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const [profileResponse, sessionResponse] = await Promise.all([
          apiClient.getProfile(),
          apiClient.validateSession(),
        ]);

        if (profileResponse.success && profileResponse.data?.user) {
          setUser(profileResponse.data.user);
        }

        if (sessionResponse.success && sessionResponse.data?.session) {
          const msRemaining = sessionResponse.data.session.timeRemaining;
          setTimeRemaining(msRemaining);
          setShowWarning(msRemaining <= 120000); // 2 minutes warning
        }
      } catch (error: any) {
        const isAuthError =
          error?.status === 401 ||
          error?.message?.includes("401") ||
          error?.message?.toLowerCase?.().includes("not authorized");

        if (isAuthError) handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [handleLogout]);

  // Local countdown timer for smooth UX
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  // Sync session time with server (stable polling)
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        const sessionResponse = await apiClient.validateSession();

        if (sessionResponse.success && sessionResponse.data?.session) {
          const msRemaining = sessionResponse.data.session.timeRemaining;
          setTimeRemaining(msRemaining);
          setShowWarning(msRemaining <= 120000);

          // Only logout if server says session is expired
          if (msRemaining <= 0) {
            handleLogout();
          }
        } else {
          // Server says no valid session, logout
          handleLogout();
        }
      } catch (error: any) {
        const isAuthError =
          error?.status === 401 ||
          error?.message?.includes("401") ||
          error?.message?.toLowerCase?.().includes("not authorized");

        if (isAuthError) {
          handleLogout();
        } else {
          console.error("Session refresh error:", error);
        }
      }
    };

    // Initial check + poll every 30s to resync remaining time
    checkSession();
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [user, handleLogout]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-14 bg-white/70 backdrop-blur-lg backdrop-saturate-150 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-md group-hover:scale-105 transition-transform"></div>
          <span className="text-xl font-bold text-slate-900">
            <span className="text-blue-600">Rahasya</span>
          </span>
        </Link>

        {/* Auto Logout Warning */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50/50 border border-slate-100">
            <Clock
              className={`w-4 h-4 ${showWarning ? "text-red-500 animate-pulse" : "text-slate-500"}`}
            />
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${showWarning ? "text-red-500" : "text-slate-500"}`}
            >
              Session
            </span>
            <div
              className={`text-lg font-mono font-bold ${showWarning ? "text-red-600" : "text-blue-600"}`}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Account & Timer */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 ${showWarning ? "animate-pulse" : ""}`}
            >
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
