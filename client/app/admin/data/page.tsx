"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Download,
  Upload,
  Trash2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface DataStats {
  totalUsers: number;
  totalPasswords: number;
  totalStorage: number;
  recentBackups: Array<{
    id: string;
    date: string;
    size: string;
    status: string;
  }>;
}

export default function AdminDataPage() {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataStats();
  }, []);

  const fetchDataStats = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockStats: DataStats = {
        totalUsers: 156,
        totalPasswords: 1247,
        totalStorage: 2.3,
        recentBackups: [
          { id: "1", date: "2024-02-15", size: "145 MB", status: "Completed" },
          { id: "2", date: "2024-02-08", size: "189 MB", status: "Completed" },
          { id: "3", date: "2024-02-01", size: "167 MB", status: "Failed" },
        ],
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Failed to fetch data stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => alert("Backup initiated.");
  const handleExport = (type: string) => alert(`Exporting ${type} data.`);
  const handleCleanup = () => {
    if (confirm("Are you sure you want to cleanup old data?")) {
      alert("Cleanup initiated.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Data Management
        </h1>
        <p className="text-slate-500">
          Manage system data, backups, and exports
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.totalUsers}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Passwords</p>
            <Database className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.totalPasswords}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Storage Used</p>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.totalStorage} GB
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">System Health</p>
            <Database className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-green-600">Healthy</div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Backup</h3>
          </div>
          <button
            onClick={handleBackup}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Backup
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Export</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("users")}
              className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Users
            </button>
            <button
              onClick={() => handleExport("pass")}
              className="flex-1 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
            >
              Passwords
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold">Cleanup</h3>
          </div>
          <button
            onClick={handleCleanup}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Run Cleanup
          </button>
        </div>
      </div>

      {/* Recent Backups Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Backups
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm font-medium">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Size</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentBackups.map((backup) => (
                <tr
                  key={backup.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-600">{backup.id}</td>
                  <td className="p-4 text-sm text-slate-600">{backup.date}</td>
                  <td className="p-4 text-sm text-slate-600">{backup.size}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        backup.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {backup.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 hover:underline text-sm font-medium">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
