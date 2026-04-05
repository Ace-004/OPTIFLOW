"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl backdrop-blur">
          <Loader2 className="h-6 w-6 animate-spin text-violet-300" />
          <p className="text-sm text-slate-300">Checking session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
