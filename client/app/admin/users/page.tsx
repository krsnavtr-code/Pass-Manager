"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserX,
  Eye,
  X,
  Shield,
  Trash2,
  Mail,
  Calendar,
  Activity,
} from "lucide-react";
import apiClient from "@/lib/api";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  loginCount: number;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Core Fetching (Your Original Logic)
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

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
          headers: { Authorization: `Bearer ${apiClient.getToken()}` },
        },
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

  // Restored: Your specific Update/Delete Logic
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
        },
      );
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Status update failed:", error);
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
        },
      );
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Role update failed:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm("Are you sure you want to delete this user and all their data?")
    )
      return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${apiClient.getToken()}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Restored: Your Original Modal UI (with better styling)
  const UserModal = ({
    user,
    onClose,
  }: {
    user: AdminUser;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">User Profile</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Role Permission
              </label>
              <select
                value={user.role}
                onChange={(e) => updateUserRole(user._id, e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="user">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Account Status
              </label>
              <button
                onClick={() => updateUserStatus(user._id, !user.isActive)}
                className={`w-full p-2 rounded-lg text-sm font-bold transition-all ${user.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}
              >
                {user.isActive ? "Active Account" : "Suspended"}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Logins
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {user.loginCount} times
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Last Activity
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Member Since
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              deleteUser(user._id);
              onClose();
            }}
            className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete User
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters (Simplified UI, same functionality) */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            User Management
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:w-40 p-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-40 p-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table (Restored All Columns) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">
                User
              </th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">
                Role
              </th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">
                Status
              </th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">
                Logins
              </th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">
                Joined
              </th>
              <th className="p-4 text-right text-xs font-bold text-slate-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-4">
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => updateUserStatus(user._id, !user.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">
                  {user.loginCount}
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (Your exact logic) */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-2">
          <p className="text-sm font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-white transition-all"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-white transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
