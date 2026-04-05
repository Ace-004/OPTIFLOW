"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Edit2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { BackendTask } from "@/lib/types";
import {
  formatTaskDate,
  getPriorityLabel,
  getPriorityScore,
  getPriorityTone,
  getTaskBody,
  getTaskHeadline,
} from "@/lib/task-utils";

interface TaskCardProps {
  task: BackendTask;
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: BackendTask) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const TaskCard = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
}: TaskCardProps) => {
  const isCompleted = Boolean(task.completedAt);
  const priorityScore = getPriorityScore(task);
  const priorityLabel = getPriorityLabel(priorityScore);
  const priorityTone = getPriorityTone(priorityScore);
  const headline = getTaskHeadline(task);
  const body = getTaskBody(task);

  return (
    <div
      className={cn(
        "group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_32px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_12px_28px_rgba(2,6,23,0.45)]",
        isCompleted &&
          "border-emerald-200 bg-emerald-50/60 opacity-90 dark:border-emerald-900/50 dark:bg-emerald-950/30",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete?.(task._id)}
            className="data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  "line-clamp-1 font-semibold text-slate-900 dark:text-white",
                  isCompleted && "text-slate-500 line-through",
                )}
              >
                {headline}
              </h3>
              {!compact && body && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {body}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-100 transition-all duration-200 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-xs"
                type="button"
                onClick={() => onEdit?.(task)}
                className="text-slate-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-slate-900"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                type="button"
                onClick={() => onDelete?.(task._id)}
                className="text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-900"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs capitalize", priorityTone)}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {priorityLabel}
              {priorityScore > 0 ? ` · ${priorityScore}` : ""}
            </Badge>

            {task.deadline && (
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3 w-3" />
                {formatTaskDate(task.deadline)}
              </span>
            )}

            {task.complexity?.level ? (
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock3 className="h-3 w-3" />
                Complexity {task.complexity.level}
              </span>
            ) : null}

            {isCompleted && (
              <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
