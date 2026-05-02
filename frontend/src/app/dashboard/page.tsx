"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuPlus as Plus,
  LuRefreshCcw as RefreshCcw,
  LuSparkles as Sparkles,
  LuClock3 as Clock3,
  LuTarget as Target,
  LuTrendingUp as TrendingUp,
  LuCircleCheckBig as CheckCircle2,
  LuFlame as Flame,
} from "react-icons/lu";
import AddTaskDialog from "@/components/dashboard/AddTaskDialog";
import CompleteTaskDialog from "@/components/dashboard/CompleteTaskDialog";
import DeleteTaskDialog from "@/components/dashboard/DeleteTaskDialog";
import TaskCard from "@/components/dashboard/TaskCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import type { BackendTask } from "@/lib/types";
import { formatTaskDate } from "@/lib/task-utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    tasks,
    completedTasks,
    stats,
    loading,
    error,
    refreshTasks,
    completeTask,
    deleteTask,
  } = useTasks();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BackendTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<BackendTask | null>(null);
  const [completingTask, setCompletingTask] = useState<BackendTask | null>(
    null,
  );

  const priorityTasks = useMemo(() => tasks.slice(0, 4), [tasks]);
  const upcomingDeadlines = useMemo(
    () =>
      [...tasks]
        .filter((task) => task.deadline)
        .sort(
          (left, right) =>
            new Date(left.deadline ?? "").getTime() -
            new Date(right.deadline ?? "").getTime(),
        )
        .slice(0, 3),
    [tasks],
  );

  const displayName = user?.name || user?.email?.split("@")[0] || "there";
  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="motion-fade-up space-y-6">
      <div className="motion-fade-up flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-600">
            <Sparkles className="h-4 w-4" />
            AI-powered task control
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
            Good to see you, {displayName}
          </h1>
          <div className="mt-4 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm text-slate-500 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="font-semibold text-slate-900 dark:text-slate-200">{stats.active}</span> active tasks
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-900 dark:text-slate-200">{stats.sessionCompleted}</span> completed today
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
              Live Priority Engine Active
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => void refreshTasks()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            className="w-full bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50/70">
          <CardContent className="flex items-center justify-between py-4 text-sm text-red-700">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshTasks()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="motion-fade-up grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)] [animation-delay:140ms]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/70 pb-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-violet-600" />
                  <CardTitle>Priority Tasks</CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200"
                  >
                    {stats.urgent} urgent
                  </Badge>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  Sorted by dynamic score
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {loading && (
                <div className="space-y-3">
                  <div className="surface-muted p-4">
                    <div className="skeleton-line h-4 w-3/5" />
                    <div className="mt-2 space-y-2">
                      <div className="skeleton-line h-3 w-full" />
                      <div className="skeleton-line h-3 w-4/5" />
                    </div>
                  </div>
                  <div className="surface-muted p-4">
                    <div className="skeleton-line h-4 w-1/2" />
                    <div className="mt-2 space-y-2">
                      <div className="skeleton-line h-3 w-full" />
                      <div className="skeleton-line h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              )}
              {!loading &&
                priorityTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggleComplete={() => setCompletingTask(task)}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => setDeletingTask(task)}
                  />
                ))}
              {!loading && priorityTasks.length === 0 && (
                <p className="text-sm text-slate-500">
                  No active tasks yet. Create the first one.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedTasks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Complete a task to see behavior history here.
                </p>
              ) : (
                completedTasks.slice(0, 4).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800"
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        <span className="font-medium">Completed</span>{" "}
                        {task.summary ?? task.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {task.completedAt
                          ? formatTaskDate(task.completedAt)
                          : "Just now"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">

          <Card className="surface-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add deadlines to surface them here.
                </p>
              ) : (
                upcomingDeadlines.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {task.summary ?? task.description.slice(0, 42)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {task.deadline
                          ? formatTaskDate(task.deadline)
                          : "No deadline"}
                      </p>
                    </div>
                    <Clock3 className="h-4 w-4 text-slate-400" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AddTaskDialog
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
          }
        }}
        task={editingTask}
      />
      <DeleteTaskDialog
        open={Boolean(deletingTask)}
        task={deletingTask}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTask(null);
          }
        }}
        onConfirm={async (taskId) => {
          await deleteTask(taskId);
          setDeletingTask(null);
        }}
      />
      <CompleteTaskDialog
        open={Boolean(completingTask)}
        task={completingTask}
        onOpenChange={(open) => {
          if (!open) {
            setCompletingTask(null);
          }
        }}
        onConfirm={async (taskId) => {
          await completeTask(taskId);
          setCompletingTask(null);
        }}
      />
    </div>
  );
}
