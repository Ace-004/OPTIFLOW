"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashNavbar from "@/components/DashNavbar";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.15),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className={sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}>
        <DashNavbar
          userName={user?.name ?? "User"}
          userEmail={user?.email ?? "Connected session"}
          onMenuClick={() => setMobileSidebarOpen((current) => !current)}
        />
        <main className="mx-auto w-full max-w-350 p-5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
