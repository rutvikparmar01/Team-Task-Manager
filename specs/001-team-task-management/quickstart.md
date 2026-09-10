# Quickstart: Team Task Management

Validates the feature end-to-end against the acceptance scenarios in `spec.md`, using the
contracts in `contracts/api.md` and the entities in `data-model.md`.

## Prerequisites

- Node.js 20 LTS and a package manager (npm)
- A running MongoDB instance reachable by the backend (local install or a local Docker container);
  connection string supplied via a `MONGODB_URI` environment variable

## Setup

This is an npm-workspaces monorepo (`backend/` and `frontend/` as workspaces) — install once at
the repository root, then run each workspace's dev server in its own terminal.

```bash
# from the repository root, once
npm install

# terminal 1 — backend
npm run dev --workspace=backend    # starts the API server (reads MONGODB_URI)

# terminal 2 — frontend
npm run dev --workspace=frontend    # starts the Vite dev server, calling the backend API
```

## Automated checks

```bash
npm test --workspace=backend    # Vitest + Supertest: contract + integration + unit tests
npm test --workspace=frontend    # Vitest + React Testing Library: component tests
```

## Manual validation walkthrough

Each step maps to a user story / acceptance scenario in `spec.md`.

1. **Create and view a project** (User Story 1): Open the app, create a project named "Demo
   Project". Confirm it appears in the projects list. Try submitting the create-project form with
   no name and confirm a clear validation message appears.
2. **Create and view tasks** (User Story 2): Open "Demo Project", create a task titled "Write
   report" with no priority selected. Confirm it appears with status "Todo" and priority "Medium"
   (the default). Create a second task, this time selecting a team member (add one first if none
   exist) and priority "High"; confirm both display correctly. Try submitting a task with no
   title and confirm a clear validation message appears.
3. **Move a task through workflow stages** (User Story 3): Move "Write report" from Todo → In
   Progress → Done, then back to Todo. Confirm the displayed status updates correctly at each
   step, and that moving a task to its current status does nothing and shows no error.
4. **Filter tasks** (User Story 4): With tasks in different statuses/priorities, filter by status
   "Done" alone, then by priority "High" alone, then by both together. Confirm each view shows
   only the matching tasks. Apply a filter combination that matches nothing and confirm a clear
   empty-state message (not a blank screen). Clear the filter and confirm the full list returns.
5. **View project progress** (User Story 5): With a known mix of task statuses (e.g., 4 tasks, 1
   Done), open the project and confirm the progress display reflects 1 of 4 complete. Create a
   brand-new project with zero tasks and confirm it shows a "no tasks yet" state rather than a
   percentage. Move every task in a project to "Done" and confirm the progress reflects full
   completion.

## Expected outcome

All five walkthrough steps complete without unhandled errors, every validation case shows a
specific on-screen message (not a generic failure), and the full walkthrough is completable in
under 5 minutes (spec SC-006).
