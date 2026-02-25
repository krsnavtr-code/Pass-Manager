"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Eye,
  Ban,
  AlertTriangle,
  TrendingUp,
  Clock,
  Globe,
  User,
} from "lucide-react";
import apiClient from "@/lib/api";

interface SecurityEvent {
  _id: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  resolved: boolean;
  user?: {
    name: string;
    email: string;
  };
}

interface SessionInfo {
  _id: string;
  user: {
    name: string;
    email: string;
    role: "user" | "admin";
  };
  loginTime: string;
  lastActivity: string;
  ip?: string;
}

export default function AdminSecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  // Kept your exact fetching logic and mock data
  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const mockEvents: SecurityEvent[] = [
        {
          _id: "1",
          type: "login_attempt",
          description: "Failed login attempt from unknown IP",
          severity: "medium",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          _id: "2",
          type: "password_reset",
          description: "Master password reset requested",
          severity: "low",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved: true,
        },
        {
          _id: "3",
          type: "suspicious_activity",
          description: "Multiple failed login attempts detected",
          severity: "high",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
      ];

      const sessionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sessions`,
        {
          headers: {
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        },
      );

      const sessionsData = await sessionsResponse.json();
      setEvents(mockEvents);
      setSessions(sessionsData.success ? sessionsData.data.sessions : []);
    } catch (error) {
      console.error("Failed to fetch security data:", error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        },
      );

      if (response.ok) {
        setSessions(sessions.filter((s) => s._id !== sessionId));
      }
    } catch (error) {
      console.error("Failed to revoke session:", error);
    }
  };

  // Refined Color Logic for cleaner UI
  const getSeverityStyles = (severity: string) => {
    const styles = {
      low: "text-amber-700 bg-amber-50 border-amber-200",
      medium: "text-orange-700 bg-orange-50 border-orange-200",
      high: "text-red-700 bg-red-50 border-red-200",
      critical: "text-white bg-red-600 border-red-700",
    };
    return (
      styles[severity as keyof typeof styles] ||
      "text-slate-600 bg-slate-50 border-slate-200"
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-500 font-medium">
          Loading security protocols...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Security Monitoring
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Real-time threat detection and session control.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">
            System Secure
          </span>
        </div>
      </div>

      {/* Security Events Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Security Incidents
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                No active security threats detected.
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className={`group transition-all hover:scale-[1.01] p-5 rounded-2xl border-l-4 shadow-sm border ${getSeverityStyles(event.severity)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/50 rounded-xl">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm uppercase tracking-tighter">
                          {event.type.replace(/_/g, " ")}
                        </span>
                        {event.resolved && (
                          <span className="px-2 py-0.5 text-[10px] bg-white/80 text-emerald-700 border border-emerald-200 font-bold uppercase rounded-md">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-semibold mt-1">
                        {event.description}
                      </p>
                      {event.user && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs opacity-80">
                          <User className="w-3 h-3" />
                          <span>
                            {event.user.name} ({event.user.email})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <p className="text-xs font-bold whitespace-nowrap opacity-70">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-medium opacity-60">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Sessions Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-900">
            Live Access Sessions
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            {sessions.length} Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  User Profile
                </th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Auth Level
                </th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Timestamps
                </th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Origin IP
                </th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Revoke
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-400 font-medium italic"
                  >
                    No active remote sessions detected.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session._id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                          {session.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                          session.user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {session.user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          <span>
                            In:{" "}
                            {new Date(session.loginTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span>
                            Last:{" "}
                            {new Date(
                              session.lastActivity,
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {session.ip || "0.0.0.0"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => revokeSession(session._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Force Logout"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
