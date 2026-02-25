// client\app\admin\components\Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  users: "User Management",
  security: "Security",
  data: "Data Management",
  settings: "Settings",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Split path and remove empty strings
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the main dashboard to keep UI clean
  if (segments.length <= 2 && segments[1] === "dashboard") {
    return (
       <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
    );
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link 
        href="/admin/dashboard" 
        className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Admin</span>
      </Link>

      {segments.slice(1).map((segment, index, array) => {
        const isLast = index === array.length - 1;
        const label = BREADCRUMB_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const href = `/${segments.slice(0, index + 2).join("/")}`;

        return (
          <div key={segment} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {isLast ? (
              <span className="text-slate-900 font-semibold truncate max-w-[150px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}