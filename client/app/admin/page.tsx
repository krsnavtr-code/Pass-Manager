"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Database,
  Activity,
  Search,
  Filter,
  Eye,
  Ban,
  ShieldCheck,
  UserX,
  Key,
  Clock,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
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
    byCategory: Array<{ _id: string; count: number }>;
  };
  sessions: {
    active: number;
  };
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
    isActive: boolean;
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${apiClient.getToken()}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
          body: JSON.stringify({ role }),
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user and all their data?")) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          icon={Users}
          color="bg-blue-500"
          trend={`+${stats?.users.newThisMonth || 0} this month`}
        />
        <StatCard
          title="Active Users"
          value={stats?.users.active || 0}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Total Passwords"
          value={stats?.passwords.total || 0}
          icon={Key}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Sessions"
          value={stats?.sessions.active || 0}
          icon={Activity}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats?.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {user.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    user.isActive ? "bg-green-500" : "bg-red-500"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Passwords by Category</h3>
          <div className="space-y-3">
            {stats?.passwords.byCategory.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 capitalize">{cat._id}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${stats?.passwords.total ? (cat.count / stats.passwords.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-slate-600">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-slate-700">User</th>
              <th className="text-left p-4 text-sm font-medium text-slate-700">Role</th>
              <th className="text-left p-4 text-sm font-medium text-slate-700">Status</th>
              <th className="text-left p-4 text-sm font-medium text-slate-700">Login Count</th>
              <th className="text-left p-4 text-sm font-medium text-slate-700">Joined</th>
              <th className="text-left p-4 text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user._id, e.target.value)}
                      className="px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => updateUserStatus(user._id, !user.isActive)}
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{user.loginCount}</td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete User"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "users", label: "User Management", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data Management", icon: Database },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {activeTab}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  apiClient.clearToken();
                  window.location.href = "/login";
                }}
                className="p-2 rounded hover:bg-slate-100 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-600">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "security" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Security Monitoring</h2>
              <p className="text-slate-600">Security features coming soon...</p>
            </div>
          )}
          {activeTab === "data" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Data Management</h2>
              <p className="text-slate-600">Data management tools coming soon...</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Admin Settings</h2>
              <p className="text-slate-600">Settings panel coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
