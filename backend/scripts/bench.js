#!/usr/bin/env node
/**
 * HTTP benchmark for the task list endpoint (and optionally AI analysis).
 *
 *   node scripts/bench.js --label before-n200 [--base http://localhost:5000]
 *        [--misses 30] [--hits 200] [--load 15] [--conc 50] [--ai 5]
 *
 * Needs a running backend and a seeded benchmark user (scripts/seed-benchmark.js).
 * Cache misses are produced through the API itself: any write invalidates the
 * user's cached task list, so no direct Redis access is needed.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { performance } = require("perf_hooks");

const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? def : argv[i + 1];
};
const BASE = opt("base", "http://localhost:5000");
const LABEL = opt("label", "run");
const EMAIL = opt("email", "bench@optiflow.local");
const PASSWORD = opt("password", "benchmark-pass-1");
const MISSES = parseInt(opt("misses", "30"), 10);
const HITS = parseInt(opt("hits", "200"), 10);
const LOAD_SECONDS = parseInt(opt("load", "0"), 10);
const CONC = parseInt(opt("conc", "50"), 10);
const AI_COUNT = parseInt(opt("ai", "0"), 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r1 = (x) => Math.round(x * 10) / 10;

function stats(values) {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y);
  const pick = (p) => a[Math.min(a.length - 1, Math.max(0, Math.ceil((p / 100) * a.length) - 1))];
  return {
    n: a.length,
    min: r1(a[0]),
    p50: r1(pick(50)),
    p95: r1(pick(95)),
    p99: r1(pick(99)),
    max: r1(a[a.length - 1]),
    mean: r1(a.reduce((s, v) => s + v, 0) / a.length),
  };
}

let cookie = "";
async function api(method, url, body) {
  const t0 = performance.now();
  const res = await fetch(BASE + url, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const buf = await res.arrayBuffer();
  const ms = performance.now() - t0;
  let json = null;
  try {
    json = JSON.parse(Buffer.from(buf).toString("utf8"));
  } catch {}
  return { status: res.status, ms, bytes: buf.byteLength, json, res };
}

async function login() {
  const r = await api("POST", "/api/auth/login", { email: EMAIL, password: PASSWORD });
  if (r.status !== 200) {
    throw new Error(
      `login failed (${r.status}). Did you run seed-benchmark.js against the database this server uses?`,
    );
  }
  const raw = r.res.headers.getSetCookie ? r.res.headers.getSetCookie() : [r.res.headers.get("set-cookie")];
  const c = (raw || []).find((s) => s && s.startsWith("token="));
  if (!c) throw new Error("login succeeded but no token cookie was returned");
  cookie = c.split(";")[0];
}

const getTasks = async () => {
  const r = await api("GET", "/api/task");
  if (r.status !== 200) throw new Error(`GET /api/task returned ${r.status}`);
  return r;
};

async function phaseMiss(anyTaskId) {
  const times = [];
  for (let i = 0; i < MISSES; i++) {
    const inv = await api("PATCH", `/api/task/${anyTaskId}`, {});
    if (inv.status !== 200) throw new Error(`cache invalidation (PATCH) returned ${inv.status}`);
    times.push((await getTasks()).ms);
  }
  return stats(times);
}

async function phaseHit(anyTaskId) {
  await api("PATCH", `/api/task/${anyTaskId}`, {});
  await getTasks(); // fills the cache
  const times = [];
  for (let i = 0; i < HITS; i++) times.push((await getTasks()).ms);
  return stats(times);
}

async function phaseLoad(anyTaskId) {
  await api("PATCH", `/api/task/${anyTaskId}`, {});
  await getTasks();
  const times = [];
  let errors = 0;
  const stopAt = performance.now() + LOAD_SECONDS * 1000;
  const started = performance.now();
  await Promise.all(
    Array.from({ length: CONC }, async () => {
      while (performance.now() < stopAt) {
        try {
          const r = await api("GET", "/api/task");
          if (r.status === 200) times.push(r.ms);
          else errors++;
        } catch {
          errors++;
        }
      }
    }),
  );
  const seconds = (performance.now() - started) / 1000;
  return { seconds: r1(seconds), concurrency: CONC, requests: times.length, errors, rps: r1(times.length / seconds), latency: stats(times) };
}

const SAMPLE_TASKS = [
  "Prepare the quarterly report for the finance team and send it to stakeholders",
  "Fix the intermittent timeout in the checkout API under heavy load",
  "Write unit tests for the invoice calculation module",
  "Plan the migration of the legacy database to the new cluster",
  "Review the pull request for the authentication refactor",
  "Draft the onboarding guide for new engineers joining next month",
  "Investigate why the nightly export job occasionally fails",
  "Design the dashboard layout for the analytics page",
];

async function phaseAI() {
  const run = Math.random().toString(36).slice(2, 7);
  const descriptions = Array.from(
    { length: AI_COUNT },
    (_, i) => `${SAMPLE_TASKS[i % SAMPLE_TASKS.length]} (${run}-${i})`,
  );
  const deadline = new Date(Date.now() + 3 * 86400000).toISOString();
  const created = [];
  const measure = async (list) => {
    const times = [];
    let fallback = 0;
    for (const description of list) {
      const r = await api("POST", "/api/task", { description, deadline });
      if (r.status !== 201) throw new Error(`POST /api/task returned ${r.status}`);
      times.push(r.ms);
      created.push(r.json.data._id);
      if (String(r.json.data.summary || "").startsWith("[AI Unavailable]")) fallback++;
      await sleep(1000); // stay clear of free-tier rate limits
    }
    return { latency: stats(times), aiUnavailable: fallback };
  };
  const first = await measure(descriptions); // not cached: calls Gemini
  const repeat = await measure(descriptions); // analysis cached in Redis
  for (const id of created) await api("DELETE", `/api/task/${id}`);
  return { uniqueDescriptions: first, repeatedDescriptions: repeat };
}

(async () => {
  await login();
  const probe = await getTasks();
  const { active = [], completed = [] } = probe.json.data;
  const all = [...active, ...completed];
  if (!all.length) throw new Error("no tasks found; run seed-benchmark.js first");

  console.log(`Benchmarking ${BASE} as ${EMAIL}: ${active.length} active + ${completed.length} completed tasks, ${r1(probe.bytes / 1024)} KB per response`);
  for (let i = 0; i < 3; i++) await getTasks(); // warm-up

  const result = {
    label: LABEL,
    when: new Date().toISOString(),
    env: { node: process.version, platform: `${os.platform()} ${os.arch()}`, cpus: os.cpus().length, memGB: Math.round(os.totalmem() / 2 ** 30) },
    tasks: { active: active.length, completed: completed.length, total: all.length, responseKB: r1(probe.bytes / 1024) },
  };

  console.log(`- cache miss x${MISSES} ...`);
  result.cacheMissMs = await phaseMiss(all[0]._id);
  console.log(`- cache hit x${HITS} ...`);
  result.cacheHitMs = await phaseHit(all[0]._id);
  if (result.cacheHitMs.p50 > 0.5 * result.cacheMissMs.p50) {
    console.warn("  WARNING: hits are not much faster than misses. Is Redis connected (REDIS_URL set)?");
  }
  if (LOAD_SECONDS > 0) {
    console.log(`- load: ${CONC} concurrent clients for ${LOAD_SECONDS}s (cache hits) ...`);
    result.load = await phaseLoad(all[0]._id);
  }
  if (AI_COUNT > 0) {
    console.log(`- AI analysis x${AI_COUNT} (uses your Gemini quota) ...`);
    result.ai = await phaseAI();
  }

  const dir = path.join(__dirname, "bench-results");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${LABEL}.json`);
  fs.writeFileSync(file, JSON.stringify(result, null, 2));
  console.log("\n" + JSON.stringify(result, null, 2));
  console.log(`\nSaved ${file}`);
})().catch((err) => {
  console.error("Benchmark failed:", err.message);
  process.exit(1);
});
