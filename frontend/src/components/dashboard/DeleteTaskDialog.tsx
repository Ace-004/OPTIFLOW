"use client";

import { useState } from "react";
import {
  LuTriangleAlert as AlertTriangle,
  LuLoaderCircle as Loader2,
  LuTrash2 as Trash2,
} from "react-icons/lu";
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

interface DeleteTaskDialogProps {
  open: boolean;
  task?: BackendTask | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (taskId: string) => Promise<void>;
}

export default function DeleteTaskDialog({
  open,
  task,
  onOpenChange,
  onConfirm,
}: DeleteTaskDialogProps) {
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
          : "Unable to delete task.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Task
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove
            <span className="font-medium text-slate-700">
              {" "}
              {task?.summary ?? task?.description ?? "this task"}
            </span>
            .
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
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Task
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
