import {
  AIInsightsPayload,
  AuthSession,
  AuthUser,
  BackendTask,
  TaskFormValues,
} from "./types";

// Use NEXT_PUBLIC_API_BASE_URL when set; otherwise use relative paths
// so dev proxy (next.config.js rewrites) can forward requests to backend.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = RequestInit & {
  json?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);

  let body = options.body;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    // send cookies (HttpOnly) for auth-aware requests
    credentials: "include",
    ...options,
    headers,
    body,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new ApiError(
      (payload as { message?: string } | null)?.message ??
        `Request failed with status ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload as T;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: AuthUser & { _id?: string };
  token?: string;
}

export function normalizeAuthUser(
  user: (AuthUser & { _id?: string }) | undefined,
  fallbackEmail = "",
): AuthUser {
  if (!user) {
    return {
      id: "",
      name: fallbackEmail.split("@")[0] || "User",
      email: fallbackEmail,
    };
  }

  return {
    id: user.id ?? user._id ?? "",
    name: user.name || fallbackEmail.split("@")[0] || "User",
    email: user.email || fallbackEmail,
  };
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    json: payload,
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    json: payload,
  });
}

export async function getSession() {
  return request<{ userId: string }>("/me", {
    method: "GET",
  });
}

export async function getTasks() {
  return request<{ success: boolean; data: { active: BackendTask[]; completed: BackendTask[] } }>("/api/task", {
    method: "GET",
  });
}

export async function createTask(payload: TaskFormValues) {
  return request<{ success: boolean; data: BackendTask }>("/api/task", {
    method: "POST",
    json: payload,
  });
}

export async function updateTask(taskId: string, payload: TaskFormValues) {
  return request<{ success: boolean; data: BackendTask }>(
    `/api/task/${taskId}`,
    {
      method: "PATCH",
      json: payload,
    },
  );
}

export async function completeTask(taskId: string) {
  return request<{ success: boolean; data: BackendTask }>(
    `/api/task/${taskId}/complete`,
    {
      method: "PATCH",
    },
  );
}

export async function deleteTask(taskId: string) {
  return request<{ success: boolean; message?: string }>(
    `/api/task/${taskId}`,
    {
      method: "DELETE",
    },
  );
}

export async function getInsights() {
  return request<{ success: boolean; data: AIInsightsPayload }>(
    "/api/insights",
    {
      method: "GET",
    },
  );
}

export type { AuthSession, AuthUser, BackendTask };
