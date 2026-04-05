import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
