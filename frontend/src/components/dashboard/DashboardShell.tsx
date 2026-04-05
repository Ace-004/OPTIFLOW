"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashNavbar from "@/components/DashNavbar";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.15),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
      />
      <div className={sidebarCollapsed ? "ml-16" : "ml-64"}>
        <DashNavbar
          userName={user?.name ?? "User"}
          userEmail={user?.email ?? "Connected session"}
        />
        <main className="mx-auto w-full max-w-[1400px] p-5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
