const { generateText } = require("./gemini");
const { computeBehaviorRiskFromHistory } = require("./behaviorService");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const hoursUntilDeadline = (deadline) => {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  return (date.getTime() - Date.now()) / 3600000;
};

const parseJSONFromText = (text) => {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
};

const sanitizeInsight = (insight, index) => {
  const allowedTypes = new Set([
    "suggestion",
    "pattern",
    "optimization",
    "reminder",
  ]);
  const allowedPriorities = new Set(["low", "medium", "high"]);

  if (!insight || typeof insight !== "object") return null;

  const title =
    typeof insight.title === "string" ? insight.title.trim().slice(0, 80) : "";
  const description =
    typeof insight.description === "string"
      ? insight.description.trim().slice(0, 220)
      : "";
  const type = allowedTypes.has(insight.type) ? insight.type : "suggestion";
  const priority = allowedPriorities.has(insight.priority)
    ? insight.priority
    : "medium";

  if (!title || !description) return null;

  return {
    id: String(index + 1),
    title,
    description,
    type,
    priority,
  };
};

const buildFallbackInsights = ({
  activeTasks,
  completedTasks,
  urgentCount,
  overdueCompletions,
  staleTasks,
  behaviorRisk,
}) => {
  const fallback = [];

  fallback.push({
    id: "1",
    title: "Urgent Queue Review",
    description:
      urgentCount > 0
        ? `${urgentCount} active task${urgentCount > 1 ? "s are" : " is"} time-critical. Tackle the top one before starting new work.`
        : "No urgent tasks detected right now. Use this window for deep work on high-impact items.",
    type: "suggestion",
    priority: urgentCount > 0 ? "high" : "low",
  });

  fallback.push({
    id: "2",
    title: "Execution Pattern",
    description:
      overdueCompletions > 0
        ? `${overdueCompletions} recently completed task${overdueCompletions > 1 ? "s were" : " was"} overdue. Consider adding smaller milestones for earlier progress checks.`
        : "Recent completions are mostly on time. Keep your current planning cadence.",
    type: "pattern",
    priority: overdueCompletions > 0 ? "medium" : "low",
  });

  fallback.push({
    id: "3",
    title: "Aging Task Optimization",
    description:
      staleTasks > 0
        ? `${staleTasks} active task${staleTasks > 1 ? "s have" : " has"} been open for more than 3 days. Break them into smaller next actions to speed completion.`
        : "Task aging looks healthy. Keep splitting larger work into deliverable chunks.",
    type: "optimization",
    priority: staleTasks > 0 || behaviorRisk >= 3 ? "medium" : "low",
  });

  fallback.push({
    id: "4",
    title: "Focus Reminder",
    description:
      activeTasks.length > 8
        ? "Your active queue is large. Limit today to 3 core tasks to reduce context switching."
        : "Queue size is manageable. Finish one task before switching contexts to keep momentum.",
    type: "reminder",
    priority: activeTasks.length > 8 ? "high" : "medium",
  });

  return fallback;
};

const buildMetrics = ({
  activeTasks,
  completedTasks,
  urgentCount,
  behaviorRisk,
}) => {
  const total = activeTasks.length + completedTasks.length;
  const completionRate = total
    ? Math.round((completedTasks.length / total) * 100)
    : 0;

  const allScores = [...activeTasks, ...completedTasks].map((task) => {
    return toNumber(task.priorityDynamic, toNumber(task.priority?.score, 0));
  });

  const averagePriority = allScores.length
    ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    : 0;

  const completedWithDuration = completedTasks
    .map((task) => toNumber(task.behavior?.completionTimeHours, NaN))
    .filter((value) => Number.isFinite(value));

  const averageFocusHours = completedWithDuration.length
    ? completedWithDuration.reduce((sum, value) => sum + value, 0) /
      completedWithDuration.length
    : Math.max(1, Math.min(activeTasks.length, 8));

  const productivityScore = clamp(
    Math.round(
      completionRate * 0.45 +
        clamp(averagePriority * 9, 0, 35) +
        clamp(urgentCount * 2, 0, 10) +
        clamp((6 - behaviorRisk) * 4, 0, 20),
    ),
    0,
    100,
  );

  return {
    productivityScore,
    completionRate,
    focusTime: `${averageFocusHours.toFixed(1)}h avg`,
  };
};

const generateAIInsights = async ({
  activeTasks,
  completedTasks,
  urgentCount,
  overdueCompletions,
  staleTasks,
  behaviorRisk,
}) => {
  const compactActive = activeTasks.slice(0, 10).map((task) => ({
    summary: task.summary || task.description?.slice(0, 100) || "Task",
    priorityDynamic: toNumber(
      task.priorityDynamic,
      toNumber(task.priority?.score, 0),
    ),
    deadlineHoursLeft: hoursUntilDeadline(task.deadline),
    ageDays: Math.max(
      0,
      Math.round(
        (Date.now() - new Date(task.createdAt || Date.now())) / 86400000,
      ),
    ),
  }));

  const prompt = `
You are generating productivity insights for a task management app.

Return strict JSON only in this format:
{
  "insights": [
    {
      "title": "",
      "description": "",
      "type": "suggestion|pattern|optimization|reminder",
      "priority": "low|medium|high"
    }
  ]
}

Rules:
- Provide exactly 4 insights.
- Keep each title under 8 words.
- Keep each description under 160 characters.
- Be specific, actionable, and based only on given data.

Data:
${JSON.stringify(
  {
    activeCount: activeTasks.length,
    completedCount: completedTasks.length,
    urgentCount,
    overdueCompletions,
    staleTasks,
    behaviorRisk,
    activeTasks: compactActive,
  },
  null,
  2,
)}
`;

  const text = await generateText(prompt);
  const parsed = parseJSONFromText(text);
  if (!parsed || !Array.isArray(parsed.insights)) return null;

  const sanitized = parsed.insights
    .slice(0, 4)
    .map((insight, index) => sanitizeInsight(insight, index))
    .filter(Boolean);

  if (sanitized.length < 3) return null;
  return sanitized;
};

exports.buildInsightsPayload = async (tasks) => {
  const allTasks = Array.isArray(tasks) ? tasks : [];
  const completedTasks = allTasks.filter((task) => Boolean(task.completedAt));
  const activeTasks = allTasks.filter((task) => !task.completedAt);

  const urgentCount = activeTasks.filter((task) => {
    const dynamicScore = toNumber(
      task.priorityDynamic,
      toNumber(task.priority?.score, 0),
    );
    const hoursLeft = hoursUntilDeadline(task.deadline);
    return dynamicScore >= 8 || (hoursLeft !== null && hoursLeft <= 24);
  }).length;

  const overdueCompletions = completedTasks.filter(
    (task) => task.behavior?.wasOverDue,
  ).length;

  const staleTasks = activeTasks.filter((task) => {
    const createdAt = new Date(task.createdAt || Date.now()).getTime();
    return Date.now() - createdAt > 3 * 86400000;
  }).length;

  const behaviorRisk = computeBehaviorRiskFromHistory(completedTasks);
  const metrics = buildMetrics({
    activeTasks,
    completedTasks,
    urgentCount,
    behaviorRisk,
  });

  const fallbackInsights = buildFallbackInsights({
    activeTasks,
    completedTasks,
    urgentCount,
    overdueCompletions,
    staleTasks,
    behaviorRisk,
  });

  try {
    const aiInsights = await generateAIInsights({
      activeTasks,
      completedTasks,
      urgentCount,
      overdueCompletions,
      staleTasks,
      behaviorRisk,
    });

    if (aiInsights) {
      return {
        insights: aiInsights,
        metrics,
        generatedBy: "ai",
      };
    }
  } catch {
    // Fall back to deterministic insights when AI is unavailable.
  }

  return {
    insights: fallbackInsights,
    metrics,
    generatedBy: "fallback",
  };
};
