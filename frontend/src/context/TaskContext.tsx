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
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<BackendTask[]>([]);
  const [sessionCompletedTasks, setSessionCompletedTasks] = useState<BackendTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const response = await getTasksRequest();
      const activeTasks = Array.isArray(response.data?.active)
        ? response.data.active.sort(
            (left, right) => getPriorityScore(right) - getPriorityScore(left),
          )
        : [];
      const compTasks = Array.isArray(response.data?.completed)
        ? response.data.completed.sort(
            (left, right) => new Date(right.completedAt!).getTime() - new Date(left.completedAt!).getTime()
          )
        : [];

      setTasks(activeTasks);
      setCompletedTasks(compTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshTasks();
    } else {
      setTasks([]);
      setCompletedTasks([]);
      setSessionCompletedTasks([]);
      setError(null);
    }
  }, [isAuthenticated, refreshTasks]);

  const createTask = useCallback(
    async (payload: TaskFormValues) => {
      if (!isAuthenticated) return;

      const response = await createTaskRequest(payload);
      setTasks((current) =>
        [response.data, ...current].sort(
          (left, right) => getPriorityScore(right) - getPriorityScore(left),
        ),
      );
    },
    [isAuthenticated],
  );

  const updateTask = useCallback(
    async (taskId: string, payload: TaskFormValues) => {
      if (!isAuthenticated) return;

      const response = await updateTaskRequest(taskId, payload);
      setTasks((current) =>
        current
          .map((task) => (task._id === taskId ? response.data : task))
          .sort(
            (left, right) => getPriorityScore(right) - getPriorityScore(left),
          ),
      );
    },
    [isAuthenticated],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (!isAuthenticated) return;

      const response = await completeTaskRequest(taskId);
      setTasks((current) => current.filter((task) => task._id !== taskId));
      setCompletedTasks((current) => [response.data, ...current]);
      setSessionCompletedTasks((current) => [response.data, ...current]);
    },
    [isAuthenticated],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!isAuthenticated) return;

      await deleteTaskRequest(taskId);
      setTasks((current) => current.filter((task) => task._id !== taskId));
      setCompletedTasks((current) =>
        current.filter((task) => task._id !== taskId),
      );
    },
    [isAuthenticated],
  );

  const stats = useMemo<TaskStats>(() => {
    const total = tasks.length + completedTasks.length;
    const completed = completedTasks.length;
    const sessionCompleted = sessionCompletedTasks.length;
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
      sessionCompleted,
      urgent,
      averagePriority,
    };
  }, [tasks, completedTasks, sessionCompletedTasks]);

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
