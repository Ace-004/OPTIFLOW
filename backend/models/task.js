const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  description: String,
  summary: String,
  complexity: {
    level: Number,
    cognitive: Number,
    technical: Number,
    dependencies: Number,
    effort: Number,
  },
  priority: {
    score: Number,
    urgency: Number,
    importance: Number,
    effortWeight: Number,
    behaviorRisk: Number,
  },
  deadline: Date,
  completedAt: Date,
  rescheduleCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastEvaluatedAt: Date,
  priorityDynamic: Number,
  behavior: {
    completionDelayHours: Number,
    wasOverDue: Boolean,
    completionTimeHours: Number,
  },
});

module.exports = mongoose.model("Task", taskSchema);
