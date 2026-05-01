import { BackendTask } from "./types";

export function getPriorityScore(task: BackendTask) {
  return (
    task.priorityDynamic ?? task.priorityDyanmic ?? task.priority?.score ?? 0
  );
}

export function getPriorityLabel(score: number) {
  if (score >= 8) return "Urgent";
  if (score >= 6) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}

export function getPriorityTone(score: number) {
  if (score >= 8)
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-200";
  if (score >= 6)
    return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200";
  if (score >= 3)
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200";
  return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200";
}

export function formatTaskDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatInputDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

export function getTaskHeadline(task: BackendTask) {
  return task.summary?.trim() || task.description.trim();
}

export function getTaskBody(task: BackendTask) {
  if (!task.summary) return task.description;
  if (task.summary === task.description) return task.description;
  return task.description;
}
