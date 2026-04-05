"use client";

import { AuthProvider } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import { ThemeProvider } from "@/context/ThemeContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>{children}</TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
