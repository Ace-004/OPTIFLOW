export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  token?: string;
  user: AuthUser;
}

export interface TaskComplexity {
  level?: number;
  cognitive?: number;
  technical?: number;
  dependencies?: number;
  effort?: number;
}

export interface TaskPriority {
  score?: number;
  urgency?: number;
  importance?: number;
  effortWeight?: number;
  behaviorRisk?: number;
}

export interface TaskBehavior {
  completionDelayHours?: number;
  wasOverDue?: boolean;
  completionTimeHours?: number;
}

export interface BackendTask {
  _id: string;
  userId: string;
  description: string;
  summary?: string;
  complexity?: TaskComplexity;
  priority?: TaskPriority;
  deadline?: string | null;
  completedAt?: string | null;
  rescheduleCount?: number;
  createdAt?: string;
  lastEvaluatedAt?: string;
  priorityDynamic?: number;
  priorityDyanmic?: number;
  behavior?: TaskBehavior;
}

export interface TaskFormValues {
  description: string;
  deadline?: string;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  urgent: number;
  averagePriority: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: "suggestion" | "pattern" | "optimization" | "reminder";
  priority: "low" | "medium" | "high";
}

export interface AIInsightMetrics {
  productivityScore: number;
  focusTime: string;
  completionRate: number;
}

export interface AIInsightsPayload {
  insights: AIInsight[];
  metrics: AIInsightMetrics;
  generatedBy: "ai" | "fallback";
}
