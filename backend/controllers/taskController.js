const Task = require("../models/task");
const {
  computePriority,
  estimateComplexity,
  estimateUrgency,
  computePriorityAdvance,
  computeComplexityLevel,
} = require("../utils/priority");
const { analyzeTaskAI } = require("../services/taskService");
const { reprioritizeTask } = require("../services/ReprioritizationService");
const {
  computeBehaviorRiskFromHistory,
} = require("../services/behaviorService");
const { buildInsightsPayload } = require("../services/insightsService");
const redis = require("../config/redis");

exports.createTask = async (req, res) => {
  try {
    const { description, deadline } = req.body;

    let summary, urgency, complexity, priority;

    try {
      const ai = await analyzeTaskAI(description);
      if (!ai) throw new Error("AI returned invalid JSON");
      summary = ai.summary;
      urgency = ai.urgency;
      const level = computeComplexityLevel(ai.complexity);
      complexity = {
        ...ai.complexity,
        level,
      };
      const score = computePriorityAdvance({
        urgency: ai.urgency,
        importance: ai.importance,
        effort: ai.complexity.effort,
      });
      priority = {
        score,
        urgency: ai.urgency,
        importance: ai.importance,
        effortWeight: ai.complexity.effort,
        behaviorRisk: 1,
      };
    } catch (err) {
      console.log("Gemini failed, using fallback" + err);
      summary = description.split(" ").slice(0, 12).join(" ");
      urgency = estimateUrgency(description, deadline);
      complexity = estimateComplexity(description, deadline);
      priority = computePriority(urgency, complexity);
    }

    const task = await Task.create({
      userId: req.user,
      description,
      summary,
      urgency,
      complexity,
      priority,
      deadline,
    });
    await redis.safeDel(`tasks:${req.user}`);
    await redis.safeDel(`insights:${req.user}`);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const cacheKey = `tasks:${req.user}`;
    const cached = await redis.safeGet(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached) });
    }

    const tasks = await Task.find({ userId: req.user });
    const completed = tasks.filter((t) => t.completedAt);
    const active = tasks.filter((t) => !t.completedAt);

    const behaviorRisk = computeBehaviorRiskFromHistory(completed);
    for (const task of active) {
      const dynamic = reprioritizeTask(task, behaviorRisk);
      task.priorityDynamic = dynamic;
      task.priorityDyanmic = dynamic;
      task.lastEvaluatedAt = new Date();
      await task.save();
    }
    active.sort((a, b) => b.priorityDynamic - a.priorityDynamic);
    await redis.safeSet(cacheKey, JSON.stringify(active), 600);
    res.status(200).json({ success: true, data: active });
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const cacheKey = `insights:${req.user}`;
    const cached = await redis.safeGet(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached) });
    }

    const tasks = await Task.find({ userId: req.user })
      .sort({ createdAt: -1 })
      .limit(200);

    const payload = await buildInsightsPayload(tasks);
    await redis.safeSet(cacheKey, JSON.stringify(payload), 300);

    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" });
  }
};

exports.updateTask = async (req, res) => {
  const { description, deadline } = req.body;
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "task not found" });
    }

    if (description) {
      try {
        const ai = await analyzeTaskAI(description);
        if (!ai) throw new Error("AI returned invalid JSON");

        const level = computeComplexityLevel(ai.complexity);
        task.complexity = {
          ...ai.complexity,
          level,
        };

        const score = computePriorityAdvance({
          urgency: ai.urgency,
          importance: ai.importance,
          effort: ai.complexity.effort,
          behaviorRisk: task.priority?.behaviorRisk || 1,
        });

        task.priority = {
          score,
          urgency: ai.urgency,
          importance: ai.importance,
          effortWeight: ai.complexity.effort,
          behaviorRisk: task.priority?.behaviorRisk || 1,
        };
        task.summary = ai.summary;
      } catch (err) {
        const finalDeadline = deadline !== undefined ? deadline : task.deadline;
        const urgency = estimateUrgency(description, finalDeadline);
        const complexityValue = estimateComplexity(description, finalDeadline);

        task.complexity = {
          level: complexityValue,
          cognitive: complexityValue,
          technical: complexityValue,
          dependencies: complexityValue,
          effort: complexityValue,
        };
        task.priority = {
          score: computePriority(urgency, complexityValue),
          urgency,
          importance: 3,
          effortWeight: complexityValue,
          behaviorRisk: task.priority?.behaviorRisk || 1,
        };
        task.summary = description.split(" ").slice(0, 12).join(" ");
      }

      task.description = description;
    }

    if (deadline !== undefined) task.deadline = deadline;

    await task.save();
    await redis.safeDel(`tasks:${req.user}`);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "server error" });
  }
};

exports.finishTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user,
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "task not found" });
    }

    const now = new Date();
    const completionTimeHours = (now - task.createdAt) / 3600000;
    const completionDelayHours = task.deadline
      ? (now - task.deadline) / 3600000
      : 0;
    const wasOverDue = completionDelayHours > 0;
    task.completedAt = now;
    task.behavior = {
      completionTimeHours,
      wasOverDue,
      completionDelayHours,
    };
    await task.save();
    await redis.safeDel(`tasks:${req.user}`);
    await redis.safeDel(`insights:${req.user}`);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "server error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "task not found" });
    }

    await redis.safeDel(`tasks:${req.user}`);
    await redis.safeDel(`insights:${req.user}`);
    res.status(200).json({ success: true, message: "task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "server error" });
  }
};
