"use client";

import { useEffect, useState } from "react";
import AIInsightsCard from "@/components/dashboard/AIInsightsCard";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { getInsights } from "@/lib/api";
import type { AIInsightsPayload } from "@/lib/types";

export default function InsightsPage() {
  const { stats } = useTasks();
  const { token } = useAuth();
  const [payload, setPayload] = useState<AIInsightsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setPayload(null);
      return;
    }

    let cancelled = false;

    const loadInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getInsights(token);
        if (!cancelled) {
          setPayload(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load AI insights right now",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInsights();

    return () => {
      cancelled = true;
    };
  }, [
    token,
    stats.total,
    stats.completed,
    stats.active,
    stats.averagePriority,
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Insights</h1>
        <p className="text-slate-500">
          Your current session summary and suggestions.
        </p>
      </div>
      <AIInsightsCard
        insights={payload?.insights}
        productivityScore={
          payload?.metrics.productivityScore ??
          Math.min(100, 60 + stats.averagePriority * 4)
        }
        completionRate={
          payload?.metrics.completionRate ??
          (stats.total ? Math.round((stats.completed / stats.total) * 100) : 0)
        }
        focusTime={
          payload?.metrics.focusTime ?? `${Math.max(1, stats.active)}h tracked`
        }
        loading={loading}
        error={error}
      />
    </div>
  );
}
