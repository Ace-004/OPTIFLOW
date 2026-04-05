"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/context/TaskContext";
import { CalendarDays, Clock3 } from "lucide-react";
import { formatTaskDate } from "@/lib/task-utils";

export default function CalendarPage() {
  const { tasks } = useTasks();

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
        <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
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
          <Card key={task._id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-violet-600" />
                {task.summary ?? task.description.slice(0, 40)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500">{task.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  <Clock3 className="mr-1 h-3 w-3" />
                  {formatTaskDate(task.deadline)}
                </Badge>
                <span className="text-xs text-slate-400">
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
