"use client";

import { useState } from "react";
import AddTaskDialog from "@/components/dashboard/AddTaskDialog";
import CompleteTaskDialog from "@/components/dashboard/CompleteTaskDialog";
import DeleteTaskDialog from "@/components/dashboard/DeleteTaskDialog";
import TaskCard from "@/components/dashboard/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/context/TaskContext";
import type { BackendTask } from "@/lib/types";
import { CheckSquare2, RefreshCcw } from "lucide-react";

export default function TasksPage() {
  const {
    tasks,
    completedTasks,
    loading,
    error,
    refreshTasks,
    completeTask,
    deleteTask,
  } = useTasks();
  const [editingTask, setEditingTask] = useState<BackendTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<BackendTask | null>(null);
  const [completingTask, setCompletingTask] = useState<BackendTask | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-slate-500">
            Active work, sorted by dynamic priority.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refreshTasks()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare2 className="h-5 w-5 text-violet-600" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <p className="text-sm text-slate-500">Loading tasks...</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading &&
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggleComplete={() => setCompletingTask(task)}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => setDeletingTask(task)}
                />
              ))}
            {!loading && tasks.length === 0 && (
              <p className="text-sm text-slate-500">No active tasks yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed This Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTasks.length === 0 && (
              <p className="text-sm text-slate-500">
                No completed tasks in this session.
              </p>
            )}
            {completedTasks.map((task) => (
              <TaskCard key={task._id} task={task} compact />
            ))}
          </CardContent>
        </Card>
      </div>

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
