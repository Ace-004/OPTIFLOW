"use client";

import React, { useEffect, useState } from "react";
import {
  LuCalendarPlus as CalendarPlus,
  LuLoaderCircle as Loader2,
  LuSparkles as Sparkles,
} from "react-icons/lu";
import { useTasks } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BackendTask } from "@/lib/types";
import { formatInputDate } from "@/lib/task-utils";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: BackendTask | null;
}

const initialForm = {
  description: "",
  deadline: "",
};

export default function AddTaskDialog({
  open,
  onOpenChange,
  task,
}: AddTaskDialogProps) {
  const { createTask, updateTask } = useTasks();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        description: task?.description ?? "",
        deadline: formatInputDate(task?.deadline),
      });
      setError(null);
    }
  }, [open, task]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.description.trim()) {
      setError("Task description is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        description: form.description.trim(),
        deadline: form.deadline || undefined,
      };

      if (task) {
        await updateTask(task._id, payload);
      } else {
        await createTask(payload);
      }

      onOpenChange(false);
      setForm(initialForm);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save task.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <CalendarPlus className="h-4 w-4 text-white" />
            </div>
            {task ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            Describe the work item. The backend will score urgency and
            complexity automatically.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="description">Task Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="What needs to be done? Include enough context for the AI to analyze it."
              className="min-h-[120px] focus-visible:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={form.deadline}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  deadline: event.target.value,
                }))
              }
              className="focus-visible:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-slate-600">
              AI will automatically analyze urgency, importance, and complexity.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : task ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
