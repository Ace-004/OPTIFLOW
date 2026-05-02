"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AIInsightsCard from "@/components/dashboard/AIInsightsCard";
import StatsCard from "@/components/dashboard/StatsCard";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { getInsights } from "@/lib/api";
import type { AIInsightsPayload } from "@/lib/types";
import {
  LuActivity as Activity,
  LuFlame as Flame,
  LuTrendingUp as TrendingUp,
  LuListTodo as ListTodo,
  LuCircleCheckBig as CheckCircle2,
  LuTarget as Target,
} from "react-icons/lu";

export default function AnalyticsPage() {
  const { stats } = useTasks();
  const { user } = useAuth();
  const [payload, setPayload] = useState<AIInsightsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  const productivityScore = Math.min(100, 55 + stats.averagePriority * 5);

  useEffect(() => {
    if (!user) {
      setPayload(null);
      return;
    }

    let cancelled = false;

    const loadInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getInsights();
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
  }, [user, stats.total, stats.completed, stats.active, stats.averagePriority]);

  return (
    <div className="motion-fade-up space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Analytics
        </h1>
        <p className="text-slate-500">
          Your comprehensive performance dashboard and AI insights.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={stats.total}
          change={`${stats.active} active right now`}
          changeType="neutral"
          icon={ListTodo}
          iconColor="text-violet-600"
          iconBgColor="bg-violet-100"
        />
        <StatsCard
          title="Active Tasks"
          value={stats.active}
          change={`${stats.urgent} marked as urgent`}
          changeType="neutral"
          icon={Target}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Completed (All-Time)"
          value={stats.completed}
          change={`${completionRate}% completion rate`}
          changeType="positive"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatsCard
          title="Session Completed"
          value={stats.sessionCompleted}
          change="Tasks finished today"
          changeType="positive"
          icon={Flame}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-violet-600" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold">{completionRate}%</p>
            <Progress value={completionRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-orange-500" />
              Urgent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.urgent}</p>
            <p className="text-sm text-slate-500">
              Items scoring at the top of the queue.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-blue-600" />
              Average Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.averagePriority}</p>
            <p className="text-sm text-slate-500">
              Dynamic score derived from the backend.
            </p>
          </CardContent>
        </Card>
      </div>

      <AIInsightsCard
        insights={payload?.insights}
        productivityScore={
          payload?.metrics.productivityScore ?? productivityScore
        }
        completionRate={
          payload?.metrics.completionRate ?? completionRate
        }
        focusTime={
          payload?.metrics.focusTime ??
          `${Math.max(stats.active, 1)}h tracked`
        }
        loading={loading}
        error={error}
      />
    </div>
  );
}
