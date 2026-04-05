"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  completeTask as completeTaskRequest,
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  getTasks as getTasksRequest,
  updateTask as updateTaskRequest,
} from "@/lib/api";
import { getPriorityScore } from "@/lib/task-utils";
import type { BackendTask, TaskFormValues, TaskStats } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface TaskContextValue {
  tasks: BackendTask[];
  completedTasks: BackendTask[];
  stats: TaskStats;
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  createTask: (payload: TaskFormValues) => Promise<void>;
  updateTask: (taskId: string, payload: TaskFormValues) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<BackendTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    if (!token) {
      setTasks([]);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const response = await getTasksRequest(token);
      const activeTasks = Array.isArray(response.data)
        ? response.data.sort(
            (left, right) => getPriorityScore(right) - getPriorityScore(left),
          )
        : [];

      setTasks(activeTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshTasks();
    } else {
      setTasks([]);
      setCompletedTasks([]);
      setError(null);
    }
  }, [isAuthenticated, token, refreshTasks]);

  const createTask = useCallback(
    async (payload: TaskFormValues) => {
      if (!token) return;

      const response = await createTaskRequest(token, payload);
      setTasks((current) =>
        [response.data, ...current].sort(
          (left, right) => getPriorityScore(right) - getPriorityScore(left),
        ),
      );
    },
    [token],
  );

  const updateTask = useCallback(
    async (taskId: string, payload: TaskFormValues) => {
      if (!token) return;

      const response = await updateTaskRequest(token, taskId, payload);
      setTasks((current) =>
        current
          .map((task) => (task._id === taskId ? response.data : task))
          .sort(
            (left, right) => getPriorityScore(right) - getPriorityScore(left),
          ),
      );
    },
    [token],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!token) return;

      const response = await completeTaskRequest(token, taskId);
      setTasks((current) => current.filter((task) => task._id !== taskId));
      setCompletedTasks((current) => [response.data, ...current]);
    },
    [token],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!token) return;

      await deleteTaskRequest(token, taskId);
      setTasks((current) => current.filter((task) => task._id !== taskId));
      setCompletedTasks((current) =>
        current.filter((task) => task._id !== taskId),
      );
    },
    [token],
  );

  const stats = useMemo<TaskStats>(() => {
    const total = tasks.length + completedTasks.length;
    const completed = completedTasks.length;
    const active = tasks.length;
    const urgent = tasks.filter((task) => getPriorityScore(task) >= 8).length;
    const combinedTasks = [...tasks, ...completedTasks];
    const averagePriority = combinedTasks.length
      ? Math.round(
          combinedTasks.reduce((sum, task) => sum + getPriorityScore(task), 0) /
            combinedTasks.length,
        )
      : 0;

    return {
      total,
      active,
      completed,
      urgent,
      averagePriority,
    };
  }, [tasks, completedTasks]);

  const value = useMemo(
    () => ({
      tasks,
      completedTasks,
      stats,
      loading,
      error,
      refreshTasks,
      createTask,
      updateTask,
      completeTask,
      deleteTask,
    }),
    [
      tasks,
      completedTasks,
      stats,
      loading,
      error,
      refreshTasks,
      createTask,
      updateTask,
      completeTask,
      deleteTask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
}
