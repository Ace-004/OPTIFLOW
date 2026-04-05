"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BackendTask } from "@/lib/types";

interface CompleteTaskDialogProps {
  open: boolean;
  task?: BackendTask | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (taskId: string) => Promise<void>;
}

export default function CompleteTaskDialog({
  open,
  task,
  onOpenChange,
  onConfirm,
}: CompleteTaskDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!task?._id) return;
    setSubmitting(true);
    setError(null);

    try {
      await onConfirm(task._id);
      onOpenChange(false);
    } catch (dialogError) {
      setError(
        dialogError instanceof Error
          ? dialogError.message
          : "Unable to complete task.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            Mark Task Complete
          </DialogTitle>
          <DialogDescription>
            Mark
            <span className="font-medium text-slate-700">
              {" "}
              {task?.summary ?? task?.description ?? "this task"}
            </span>
            as completed?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => void handleConfirm()}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Complete Task
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
