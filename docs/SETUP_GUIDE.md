# Setup Guide

This document covers everything required to get UniLodge running locally for development, including environment configuration, database setup, and optional Docker usage.

---

## Prerequisites

Ensure the following are installed before proceeding:

| Tool       | Minimum Version | Notes                                  |
|------------|-----------------|----------------------------------------|
| Node.js    | 18.x            | LTS recommended                        |
| npm        | 9.x             | Bundled with Node 18                   |
| Git        | 2.x             | Any recent version                     |
| MongoDB    | 6.x             | Local install or Atlas free tier       |
| PostgreSQL | 15.x            | Required for analytics queries         |
| Docker     | 24.x            | Optional — replaces manual DB installs |

---

## 1. Clone and Install

```bash
git clone <repo-url>
cd unilodge
npm install
```

`npm install` at the repository root installs dependencies for all four workspaces (`apps/frontend`, `apps/backend`, `apps/ai-engine`, `packages/shared`) via npm workspaces.

---

## 2. Environment Variables

Copy the example file and populate it with your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values. Refer to the table below:

| Variable                   | Required | Description                                        |
|----------------------------|----------|----------------------------------------------------|
| `NEXT_PUBLIC_API_URL`      | Yes      | Full URL of the backend API (e.g. `http://localhost:5001/api`) |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | Yes | Public-safe OpenRouter key for frontend AI calls  |
| `PORT`                     | No       | Backend port (defaults to `5001`)                  |
| `DATABASE_URL`             | Yes      | PostgreSQL connection string                       |
| `MONGO_URI`                | Yes      | MongoDB connection URI                             |
| `JWT_SECRET`               | Yes      | Long, random string — keep secret                  |
| `OPENROUTER_API_KEY`       | Yes      | Secret OpenRouter key for backend/AI engine        |
| `OPENROUTER_MODEL`         | No       | Model slug (defaults to `openai/gpt-3.5-turbo`)    |
| `HUGGING_FACE_API_KEY`     | No       | Required only if using Hugging Face inference      |
| `STRIPE_SECRET_KEY`        | No       | Required for payment features                      |
| `LOG_LEVEL`                | No       | `info` (default), `debug`, `warn`, or `error`      |

> **Important:** Never commit `.env.local` or any file containing real secrets. It is listed in `.gitignore`.

---

## 3. Database Setup

### MongoDB

If running locally, start the MongoDB daemon:

```bash
mongod --dbpath /usr/local/var/mongodb
```

The backend will automatically create the required collections on first run. No manual schema creation is needed.

### PostgreSQL

Create the database and run migrations:

```bash
# Create the database
createdb unilodge

# Run migration scripts (stored in /docs/migration/)
psql -d unilodge -f docs/migration/<migration-file>.sql
```

Migrations are numbered and must be run in order. See `/docs/migration/` for all available scripts. The migration directory is currently a placeholder — scripts will be added as the analytics layer is built out.

---

## 4. Start Development Servers

### All services simultaneously

```bash
npm run dev
```

This runs all workspaces in parallel. Services start on the following ports:

| Service    | Port | URL                       |
|------------|------|---------------------------|
| Frontend   | 3000 | http://localhost:3000      |
| Backend    | 5001 | http://localhost:5001      |
| AI Engine  | 3002 | http://localhost:3002      |

### Individual services

```bash
npm run dev:frontend   # Next.js only
npm run dev:backend    # Express API only
npm run dev:ai         # AI engine only
```

---

## 5. Docker (Optional)

A `docker-compose.yml` is provided at the repository root. This starts MongoDB, PostgreSQL, and all application services without any local installs beyond Docker itself.

```bash
# Start all containers in the background
docker compose up -d

# Tail logs
docker compose logs -f

# Stop all containers
docker compose down
```

> Ensure Docker Desktop is running before executing these commands.

---

## 6. Running Tests

```bash
# All workspaces
npm run test

# Single workspace
npm run test --workspace=apps/frontend
npm run test --workspace=apps/backend
```

---

## 7. Building for Production

```bash
npm run build
```

Each workspace produces its own build artefacts. The frontend outputs to `apps/frontend/.next`, and the backend and AI engine compile TypeScript to their respective `dist/` directories.

---

## Troubleshooting

**Port already in use**
Change the conflicting port in `.env.local` and restart the relevant service.

**MongoDB connection refused**
Verify `mongod` is running and that `MONGO_URI` in `.env.local` points to the correct host and port.

**`npm install` fails with peer dependency errors**
Ensure you are using Node 18 or later. Run `node -v` to check.

**TypeScript compilation errors**
Run `npx tsc --noEmit` in the affected workspace to get a detailed error list before starting the dev server.
