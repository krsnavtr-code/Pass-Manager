// client\app\admin\dashboard\page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  TrendingUp,
  UserCheck,
  Key,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import apiClient from "@/lib/api";

interface AdminStats {
  users: {
    total: number;
    active: number;
    admin: number;
    newThisMonth: number;
  };
  passwords: {
    total: number;
    byCategory: Array<{
      _id: string;
      count: number;
    }>;
  };
  sessions: {
    active: number;
  };
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section for the dashboard specifically */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          System Overview
        </h2>
        <p className="text-slate-500">
          Monitor your platform's health and user activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.users.total}
          icon={Users}
          color="bg-blue-600"
          trend={
            stats?.users.newThisMonth
              ? `+${stats.users.newThisMonth} this month`
              : undefined
          }
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={stats?.users.active}
          icon={UserCheck}
          color="bg-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Stored Credentials"
          value={stats?.passwords.total}
          icon={Key}
          color="bg-violet-600"
          loading={loading}
        />
        <StatCard
          title="Active Sessions"
          value={stats?.sessions.active}
          icon={Activity}
          color="bg-orange-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users - Spans 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">
              Recent User Registration
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {loading ? (
                <SkeletonList count={5} />
              ) : (
                stats?.recentUsers?.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                          user.role === "admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Categories - Spans 1 column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-6">
            Password Distribution
          </h3>
          <div className="space-y-6">
            {loading ? (
              <SkeletonList count={4} />
            ) : (
              stats?.passwords.byCategory?.map((cat) => (
                <div key={cat._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 capitalize">
                      {cat._id}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {cat.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${stats?.passwords.total ? (cat.count / stats.passwords.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ title, value, icon: Icon, color, trend, loading }: any) {
  if (loading)
    return <div className="h-32 bg-slate-200 animate-pulse rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-black text-slate-900">
            {value?.toLocaleString() || 0}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-medium text-xs">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-inner`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
        ))}
    </div>
  );
}
