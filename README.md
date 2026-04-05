# OptiFlow

OptiFlow is a full-stack task management app with an Express/MongoDB backend and a Next.js frontend. It includes authentication, task CRUD, task completion flows, dashboard views, and AI-powered insights.

## Project Structure

- `backend/` - Express API, MongoDB models, auth middleware, Redis cache helpers, and AI services.
- `frontend/` - Next.js app router UI for auth, dashboard, analytics, calendar, insights, and settings.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Radix UI
- Backend: Node.js, Express, MongoDB, Redis, JWT
- AI: Google Gemini integration for insight generation

## Features

- User registration and login
- JWT-protected API routes
- Task create, update, complete, and delete actions
- Dashboard pages for tasks, calendar, analytics, insights, and settings
- AI-generated task insights and prioritization support

## Prerequisites

- Node.js 18 or newer
- MongoDB instance
- Redis instance optional, used for cache support
- Google Gemini API key for AI features

## Setup

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Backend Environment

Create a `backend/.env` file with:

```dotenv
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET_KEY=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
REDIS_URL=redis://127.0.0.1:6379
```

`REDIS_URL` is optional. If Redis is unavailable, the app continues without cache support.

### Frontend Environment

Create a `frontend/.env.local` file with:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Update this value if your backend runs on a different host or port.

## Run Locally

Start the backend from `backend/`:

```bash
npm start
```

Start the frontend from `frontend/`:

```bash
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend runs on `http://localhost:3000` by default.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /me`
- `GET /api/task`
- `POST /api/task`
- `PATCH /api/task/:id`
- `DELETE /api/task/:id`
- `PATCH /api/task/:id/complete`

## Notes

- The frontend stores auth state in local storage under `optiflow-auth`.
- Protected dashboard routes include `/dashboard`, `/dashboard/tasks`, `/dashboard/calendar`, `/dashboard/analytics`, `/dashboard/insights`, and `/dashboard/settings`.
