"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  HelpCircle,
  Shield,
  Key,
  Database,
  LayoutGrid,
  KeyRound,
} from "lucide-react";

export default function RefinedFooter() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
    { icon: KeyRound, label: "Vault", href: "/dashboard/vault" },
    // { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    // { icon: Shield, label: "Security", href: "/dashboard/security" },
    // { icon: Key, label: "Master Key", href: "/dashboard/master-password" },
    // { icon: Database, label: "Backup", href: "/dashboard/backup" },
    { icon: HelpCircle, label: "Support", href: "/dashboard/help" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-fit z-50 px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden transition-all duration-500 ease-in-out">
        
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-40" />

        <div className="px-2 py-1.5">
          {/* 2. Changed justify-between to justify-center and used flex-nowrap */}
          <div className="flex items-center justify-center gap-1 flex-nowrap">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  // 3. Removed min-w-[70px] to let content define size, added px-4 for breathing room
                  className={`group relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-300 
                    ${isActive 
                      ? "bg-blue-50/80" 
                      : "hover:bg-slate-50"
                    }`}
                >
                  <div className={`relative z-10 transition-all duration-300 ${isActive ? "-translate-y-0.5" : "group-hover:-translate-y-1"}`}>
                    <Icon 
                      className={`w-5 h-5 transition-colors duration-300
                        ${isActive ? "text-blue-600 stroke-[2.5px]" : "text-slate-400 group-hover:text-slate-600"}
                      `} 
                    />
                  </div>

                  <span className={`text-[10px] mt-1 font-bold transition-colors duration-300
                    ${isActive ? "text-blue-700" : "text-slate-400 group-hover:text-slate-900"}
                  `}>
                    {item.label}
                  </span>

                  <div className={`absolute bottom-1 h-1 bg-blue-600 rounded-full transition-all duration-500 ease-out
                    ${isActive ? "w-4 opacity-100" : "w-0 opacity-0 group-hover:w-2 group-hover:opacity-40"}
                  `} />
                  
                  {isActive && (
                    <div className="absolute inset-0 bg-blue-400/5 blur-lg rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}