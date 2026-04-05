"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/context/TaskContext";
import { Activity, Flame, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const { stats } = useTasks();
  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-slate-500">
          Simple performance readout from the current session.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
    </div>
  );
}
