/**
 * Seeds a benchmark user and N tasks directly into MongoDB (no Gemini calls).
 *
 *   MONGODB_URI=mongodb://127.0.0.1:27017/optiflow-bench node scripts/seed-benchmark.js 200
 *
 * Re-running replaces the benchmark user's tasks. Never point this at a real database.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Task = require("../models/task");
const { computePriorityAdvance } = require("../utils/priority");

const EMAIL = "bench@optiflow.local";
const PASSWORD = "benchmark-pass-1";
const N = Math.max(1, parseInt(process.argv[2], 10) || 200);
const COMPLETED_SHARE = 0.3;
const DAY = 24 * 3600 * 1000;

const rand = (min, max) => min + Math.random() * (max - min);
const int = (min, max) => Math.floor(rand(min, max + 1));

function makeTask(userId, completed) {
  const now = Date.now();
  const urgency = int(1, 5);
  const importance = int(1, 5);
  const effort = int(1, 5);
  const createdAt = new Date(now - rand(1, 20) * DAY);
  const doc = {
    userId,
    description: `Benchmark task ${Math.random().toString(36).slice(2, 8)}: review, plan and complete the assigned work item`,
    summary: "Benchmark task",
    complexity: {
      level: int(1, 5),
      cognitive: int(1, 5),
      technical: int(1, 5),
      dependencies: int(1, 5),
      effort,
    },
    priority: {
      score: computePriorityAdvance({ urgency, importance, effort }),
      urgency,
      importance,
      effortWeight: effort,
      behaviorRisk: 1,
    },
    deadline: new Date(now + rand(-3, 14) * DAY),
    createdAt,
  };
  if (completed) {
    const completedAt = new Date(createdAt.getTime() + rand(1, 10) * DAY);
    const delay = (completedAt - doc.deadline) / 3600000;
    doc.completedAt = completedAt;
    doc.behavior = {
      completionTimeHours: (completedAt - createdAt) / 3600000,
      completionDelayHours: delay,
      wasOverDue: delay > 0,
    };
  }
  return doc;
}

async function clearRedisKeys(userId) {
  if (!process.env.REDIS_URL) return;
  try {
    const { createClient } = require("redis");
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", () => {});
    await client.connect();
    await client.del([`tasks:${userId}`, `insights:${userId}`]);
    await client.quit();
  } catch {
    console.warn("(could not clear Redis keys; restart the server if numbers look stale)");
  }
}

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (/mongodb\+srv:/.test(uri) && !process.argv.includes("--allow-remote")) {
    throw new Error(
      "Refusing to seed a remote (mongodb+srv) database. Use a local benchmark database, or pass --allow-remote if you are sure.",
    );
  }
  await mongoose.connect(uri);

  let user = await User.findOne({ email: EMAIL });
  if (!user) {
    user = await User.create({
      name: "Benchmark User",
      email: EMAIL,
      password: await bcrypt.hash(PASSWORD, 10),
      provider: "local",
    });
  }
  await Task.deleteMany({ userId: user._id });

  const docs = [];
  for (let i = 0; i < N; i++) docs.push(makeTask(user._id, Math.random() < COMPLETED_SHARE));
  await Task.insertMany(docs);
  await clearRedisKeys(user._id);

  const completed = docs.filter((d) => d.completedAt).length;
  console.log(
    `Seeded ${N} tasks (${N - completed} active, ${completed} completed) for ${EMAIL} in ${mongoose.connection.name}`,
  );
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
