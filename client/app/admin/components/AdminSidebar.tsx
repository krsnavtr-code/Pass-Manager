// client\app\admin\components\AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield, Database, Activity, Settings, ShieldCheck, X } from "lucide-react";

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Activity, path: "/admin/dashboard" },
  { id: "users", label: "User Management", icon: Users, path: "/admin/users" },
  { id: "security", label: "Security", icon: Shield, path: "/admin/security" },
  { id: "data", label: "Data Management", icon: Database, path: "/admin/data" },
  { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">AdminOS</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {item.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@system.io</p>
          </div>
        </div>
      </div>
    </div>
  );
}