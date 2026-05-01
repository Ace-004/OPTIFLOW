"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AIInsight } from "@/lib/types";
import {
  LuArrowRight,
  LuBrain,
  LuClock3,
  LuSparkles,
  LuTarget,
  LuTrendingUp,
  LuZap,
} from "react-icons/lu";

interface AIInsightsCardProps {
  insights?: AIInsight[];
  productivityScore?: number;
  focusTime?: string;
  completionRate?: number;
  loading?: boolean;
  error?: string | null;
}

const defaultInsights: AIInsight[] = [
  {
    id: "1",
    title: "Peak Productivity Hours",
    description:
      "You're most productive between 9 AM - 12 PM. Schedule important tasks during this window.",
    type: "pattern",
    priority: "high",
  },
  {
    id: "2",
    title: "Task Batching Opportunity",
    description:
      "You have 5 similar email-related tasks. Consider batching them together.",
    type: "optimization",
    priority: "medium",
  },
  {
    id: "3",
    title: "Break Reminder",
    description:
      "You've been working for 2 hours straight. A short break can boost productivity.",
    type: "reminder",
    priority: "low",
  },
];

const typeConfig = {
  suggestion: {
    icon: LuSparkles,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  pattern: {
    icon: LuTrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  optimization: {
    icon: LuZap,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  reminder: {
    icon: LuClock3,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
};

const AIInsightsCard = ({
  insights = defaultInsights,
  productivityScore = 85,
  focusTime = "4h 32m",
  completionRate = 78,
  loading = false,
  error = null,
}: AIInsightsCardProps) => {
  return (
    <Card className="motion-scale-in surface-card overflow-hidden border-violet-200/50 dark:border-violet-900/40">
      {/* Header with soft glow */}
      <CardHeader className="relative overflow-hidden bg-linear-to-r from-violet-600/95 via-indigo-600/95 to-blue-600/95 px-5 py-5 sm:px-6 sm:py-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-violet-300/30 blur-2xl" />

        <div className="relative flex items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-sm backdrop-blur">
              <LuBrain className="h-5 w-5" />
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <CardTitle className="text-lg font-semibold text-white">
                AI Insights
              </CardTitle>
              <p className="mt-0.5 text-sm text-violet-100/90">
                Powered by behavioral analysis
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="surface-muted rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-violet-600 mb-1">
              <LuTarget className="h-4 w-4" />
              <span className="text-xs font-medium">Score</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {productivityScore}%
            </p>
          </div>
          <div className="surface-muted rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <LuClock3 className="h-4 w-4" />
              <span className="text-xs font-medium">Focus</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {focusTime}
            </p>
          </div>
          <div className="surface-muted rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <LuTrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Done</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {completionRate}%
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-6 space-y-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-950/55">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Overall Completion Progress</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Insights List */}
        <div className="mt-6 space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <LuSparkles className="h-4 w-4 text-violet-600" />
            Smart Suggestions
          </h4>
          {loading && (
            <div className="space-y-3">
              <div className="surface-muted p-3">
                <div className="skeleton-line h-3 w-2/5" />
                <div className="mt-2 space-y-2">
                  <div className="skeleton-line h-3 w-full" />
                  <div className="skeleton-line h-3 w-4/5" />
                </div>
              </div>
              <div className="surface-muted p-3">
                <div className="skeleton-line h-3 w-1/2" />
                <div className="mt-2 space-y-2">
                  <div className="skeleton-line h-3 w-full" />
                  <div className="skeleton-line h-3 w-3/4" />
                </div>
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {!loading && !error && insights.length === 0 && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
              No insights available yet. Add and complete a few tasks first.
            </div>
          )}
          {!loading &&
            !error &&
            insights.map((insight) => {
              const config = typeConfig[insight.type];
              const Icon = config.icon;
              return (
                <div
                  key={insight.id}
                  className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/90 p-3 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {insight.title}
                    </h5>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {insight.description}
                    </p>
                  </div>
                  <LuArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-violet-600" />
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;
