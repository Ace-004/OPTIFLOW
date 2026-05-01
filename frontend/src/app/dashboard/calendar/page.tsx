"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/context/TaskContext";
import {
  LuCalendarDays as CalendarDays,
  LuClock3 as Clock3,
} from "react-icons/lu";
import { formatTaskDate } from "@/lib/task-utils";

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const upcoming = [...tasks]
    .filter((task) => task.deadline)
    .sort(
      (left, right) =>
        new Date(left.deadline ?? "").getTime() -
        new Date(right.deadline ?? "").getTime(),
    )
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Calendar
        </h1>
        <p className="text-slate-500">
          Deadlines pulled from your active tasks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {upcoming.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="py-12 text-center text-slate-500">
              No deadlines have been added yet.
            </CardContent>
          </Card>
        )}
        {upcoming.map((task) => (
          <Card
            key={task._id}
            className="surface-card border-slate-200/80 bg-white/90 dark:border-slate-800"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-start gap-2 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
                <CalendarDays className="h-4 w-4 text-violet-600" />
                <span
                  className={expandedTaskId === task._id ? "" : "line-clamp-2"}
                >
                  {task.summary ?? task.description.slice(0, 56)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p
                className={
                  expandedTaskId === task._id
                    ? "text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                    : "line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                }
              >
                {task.description}
              </p>
              <button
                type="button"
                className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                onClick={() =>
                  setExpandedTaskId((current) =>
                    current === task._id ? null : task._id,
                  )
                }
              >
                {expandedTaskId === task._id ? "Show less" : "Show full task"}
              </button>
              <div className="flex items-center justify-between gap-3">
                <Badge
                  variant="outline"
                  className="border-violet-200 bg-violet-50/70 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300"
                >
                  <Clock3 className="mr-1 h-3 w-3" />
                  {formatTaskDate(task.deadline)}
                </Badge>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Priority {task.priorityDynamic ?? task.priority?.score ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
