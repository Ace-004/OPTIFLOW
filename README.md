# OptiFlow

**An AI-assisted task manager that decides what you should work on next.** You describe a task in plain language; Gemini scores it, a weighted formula turns the scores into a priority, and that priority keeps shifting as deadlines approach, tasks age, and your own completion history builds up.

🔗 **Live demo:** [optiflow.ayushrana.me](https://optiflow.ayushrana.me)

---

## How prioritisation works

1. **AI scoring.** When a task is created or its description changes, Gemini returns a short title and scores for urgency, importance, and four complexity factors (cognitive, technical, dependencies, effort), each 1–5. Models are tried in order (`gemini-3.1-flash-lite-preview` → `gemini-2.5-flash` → `gemini-3-flash-preview`). If all fail, a keyword- and deadline-based heuristic takes over and the task is marked `[AI Unavailable]`.
2. **Base priority.** `round(urgency × 0.4 + importance × 0.3 + behaviorRisk × 0.2 + (6 − effort) × 0.1)`, so easier tasks get a small boost.
3. **Dynamic priority.** When the task list is loaded, each active task's score is recomputed as `base + deadline pressure (0–3) + age boost (0–2) + behavior risk`. Deadline pressure rises as the deadline nears (and again once it has passed); the age boost applies after 3 and 7 days.
4. **Behavior tracking.** Completing a task records how long it took, whether it was overdue, and by how many hours. From the completed tasks, a behavior risk of 1–5 is derived from the share of overdue completions and the average delay, and it feeds back into the priority of active tasks.
5. **Insights.** The insights page sends a compact summary of your queue to Gemini for four short, actionable suggestions, with a deterministic fallback when AI is unavailable, plus metrics such as completion rate and a productivity score.

## Features

- Task create, update, complete, delete, with AI analysis on create and edit
- Dashboard, task list, calendar, analytics, insights, and settings pages
- Optional Redis caching (the app runs fine without Redis):
  - task list for 10 min and insights for 15 min, both invalidated on every write
  - AI analyses for 24 h, keyed by task text
- Auth: JWT in an httpOnly cookie, bcrypt (12 rounds), zod-validated input, Helmet, a global rate limit plus a stricter one on login/register, and a CORS allowlist

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Radix UI |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Cache | Redis (optional) |
| AI | Google Gemini |
| Auth | JWT (httpOnly cookie), bcrypt |

## Project structure

```
backend/
  controllers/   auth and task request handlers
  services/      Gemini client, AI task analysis, reprioritisation, behavior risk, insights
  utils/         priority formulas, token generation
  models/        Mongoose schemas (User, Task)
  middleware/    JWT auth
  config/        MongoDB and Redis connections
frontend/        Next.js app (dashboard, tasks, calendar, analytics, insights, settings)
```

## Getting started

Prerequisites: Node.js 18+, a MongoDB instance, a Gemini API key. Redis is optional.

```bash
git clone https://github.com/Ace-004/optiflow.git
cd optiflow

cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET_KEY, GEMINI_API_KEY
npm install
npm run dev               # http://localhost:5000

cd ../frontend
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

### Backend environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET_KEY` | yes | Secret for signing auth tokens |
| `GEMINI_API_KEY` | yes | Gemini API key (without it, tasks use the heuristic fallback) |
| `FRONTEND_URL` | yes in production | Allowed frontend origin(s), comma-separated (default `http://localhost:3000`) |
| `REDIS_URL` | no | Redis connection string; caching is skipped if unset or unreachable |
| `PORT` | no | Defaults to 5000 |
| `NODE_ENV` | no | Set to `production` when deployed (enables secure, cross-site cookies) |

### Frontend environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL, e.g. `http://localhost:5000` |

## API

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account and sign in |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Clear the auth cookie |
| GET | `/me` | Current user id |
| GET | `/api/task` | Active tasks (sorted by dynamic priority) and completed tasks |
| POST | `/api/task` | Create a task (`description`, optional `deadline`) |
| PATCH | `/api/task/:id` | Update description and/or deadline |
| PATCH | `/api/task/:id/complete` | Mark complete and record behavior data |
| DELETE | `/api/task/:id` | Delete a task |
| GET | `/api/insights` | AI-generated insights and metrics |
| GET | `/health` | Health check |

## Known limitations

- Dynamic priorities are recalculated when the task list is loaded (at most every 10 minutes because of the cache), not by a background scheduler.
- Gemini calls run inside the request and have no explicit timeout; with all three models failing, a request can be slow before the fallback kicks in.
- Loading the task list writes the recalculated priority back for each active task, one save per task.
- The `rescheduleCount` field exists on tasks but is not populated yet; behavior risk currently uses overdue ratio and average delay only.
- There are no automated tests yet.
