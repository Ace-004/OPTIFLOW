"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AIInsight } from "@/lib/types";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Brain,
  ArrowRight,
  Zap,
} from "lucide-react";

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
    icon: Sparkles,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  pattern: {
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  optimization: {
    icon: Zap,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  reminder: {
    icon: Clock,
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
    <Card className="motion-scale-in surface-card overflow-hidden">
      {/* Header with Gradient */}
      <CardHeader className="bg-linear-to-r from-violet-600 to-indigo-600 pb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-white">AI Insights</CardTitle>
              <p className="text-violet-200 text-sm">
                Powered by behavioral analysis
              </p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
            Live
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats Row - Overlapping Header */}
        <div className="grid grid-cols-3 gap-4 -mt-4">
          <div className="surface-muted p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-violet-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">Score</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {productivityScore}%
            </p>
          </div>
          <div className="surface-muted p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Focus</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {focusTime}
            </p>
          </div>
          <div className="surface-muted p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Done</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {completionRate}%
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              Daily Goal Progress (completion rate)
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Insights List */}
        <div className="mt-6 space-y-3">
          <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles className="w-4 h-4 text-violet-600" />
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
                  className="group flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {insight.title}
                    </h5>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {insight.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-violet-600" />
                </div>
              );
            })}
        </div>

        {/* View All Button */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
        >
          View All Insights
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;
