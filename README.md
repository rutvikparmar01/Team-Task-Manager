# Team Task Manager

A small team task management app, built as a demonstration of Spec-Driven Development. See
`specs/001-team-task-management/` for the spec, plan, and task breakdown that produced this code.

## Stack

- **Frontend**: React + TypeScript, Vite, React Router, TanStack Query, Tailwind CSS
- **Backend**: Node.js + TypeScript, Express, Zod
- **Database**: MongoDB + Mongoose
- **Testing**: Vitest, Supertest, React Testing Library

This is an npm-workspaces monorepo: `backend/` and `frontend/` are independent workspaces sharing
one root `package.json` and `tsconfig.base.json`. There is no authentication in this version.

## Prerequisites

- Node.js 20+ and npm
- A local MongoDB instance (or a Docker container) reachable by the backend

## Setup

```bash
# from the repository root, once
npm install

# terminal 1 — backend (reads MONGODB_URI / PORT from backend/.env; copy backend/.env.example)
npm run dev:backend

# terminal 2 — frontend
npm run dev:frontend
```

The frontend dev server runs at http://localhost:5173 and proxies `/api` to the backend at
http://localhost:3001.

## Tests

```bash
npm run test:backend    # Vitest + Supertest, against an in-memory MongoDB instance
npm run test:frontend   # Vitest + React Testing Library
npm test                # both
```

## Manual walkthrough

See `specs/001-team-task-management/quickstart.md` for a step-by-step validation walkthrough
covering every user story (create a project, create/assign a task, move it through Todo → In
Progress → Done, filter the list, and view progress).
