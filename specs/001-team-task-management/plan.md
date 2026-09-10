# Implementation Plan: Team Task Management

**Branch**: `001-team-task-management` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-team-task-management/spec.md`

## Summary

A small team task management web application: users create projects, create tasks within a
project, assign tasks to team members, set task priority, move tasks between Todo / In Progress /
Done, filter a project's tasks by status and priority, and see a project's completion progress.
There is no authentication. Technical approach: a React + TypeScript single-page frontend talking
over a REST API to a Node.js + TypeScript backend, which persists Projects, Tasks, and Team
Members in MongoDB. Input is validated at the API boundary with TypeScript-first schemas, and
business logic is kept in framework-independent service modules per the project constitution.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (backend); TypeScript 5.x with React 18
(frontend)

**Primary Dependencies**: Backend — Express, Mongoose, Zod. Frontend — React, Vite, React Router,
TanStack Query, Tailwind CSS.

**Storage**: MongoDB (single database; collections for projects, tasks, teamMembers)

**Testing**: Backend — Vitest + Supertest (API/integration) against an in-memory or local test
MongoDB instance. Frontend — Vitest + React Testing Library (component/UI).

**Target Platform**: Browser (frontend SPA) + Node.js server (backend API), run locally for
demonstration purposes

**Project Type**: Web application monorepo — separate `backend/` and `frontend/` npm workspaces in
one repository (per Option 2 structure, formalized as a monorepo per user direction)

**Performance Goals**: No specific throughput target; must feel instant for a single demo user or
a handful of concurrent users (consistent with Constitution Principle IX — demonstration scale,
not production scale)

**Constraints**: No authentication/authorization (per spec FR-017); no queues, caches, or extra
infrastructure beyond one MongoDB instance (Constitution Principle IX); free/open-source tooling
only (Constitution Principle X)

**Scale/Scope**: A handful of projects, each with up to a few dozen tasks, and a small team-member
roster — sized for demonstration, not for large-scale production data volumes

**Outstanding item carried from `/speckit-clarify`**: The question of how team members are
created/selected when assigning a task was raised but not yet answered by the user. This plan
proceeds with the previously stated *recommended* default — a small dedicated Team Member list
(create + select from existing members) rather than free-text assignee entry — because it matches
the spec's existing "Team Member" key entity and the constitution's input-validation-at-the-
boundary principle. This default is recorded in `research.md` and should be confirmed (or
overridden) before `/speckit-tasks` locks in task-level detail for team-member assignment.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. TypeScript Everywhere | Backend and frontend are both TypeScript; no plain `.js` source planned | PASS |
| II. Specification as Source of Truth | Plan derived directly from `spec.md`; no requirement invented beyond it | PASS |
| III. Acceptance Criteria for Every Requirement | Every FR-001..FR-018 in spec.md has acceptance scenarios attached | PASS |
| IV. Input Validation at the API Boundary | Zod schemas validate every request body/params before reaching services (see `contracts/`) | PASS (planned) |
| V. Business Logic Independent of HTTP Layer | `backend/src/services/` holds domain logic with no Express types imported; `backend/src/api/` stays thin | PASS (planned) |
| VI. Automated Backend Testing | Vitest + Supertest contract/integration tests planned per endpoint, including failure cases | PASS (planned) |
| VII. Reusable, Accessible Frontend Components | `frontend/src/components/` built as props-driven, semantic, labeled, focus-visible components, styled with Tailwind utility classes | PASS (planned) |
| VIII. No Unspecified Functionality | Scope limited to the 5 user stories and 18 FRs in spec.md; no extra CRUD (e.g., delete/edit-title) added | PASS |
| IX. Demonstration-Scale Simplicity | Single MongoDB instance, no queues/caches/microservices, one repo with two npm workspaces (no extra monorepo build tool) | PASS |
| X. Free and Open-Source Tooling Preference | Express, Mongoose, Zod, React, Vite, React Router, TanStack Query, Tailwind CSS, Vitest, RTL, Supertest, npm workspaces are all free/OSS | PASS |

No violations identified; Complexity Tracking table is not needed.

*Re-checked after Phase 1 design: unchanged — data model, contracts, and quickstart below stay
within the same stack and scope, so all rows above still hold.*

## Project Structure

### Documentation (this feature)

```text
specs/001-team-task-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
package.json              # root: npm workspaces ["backend", "frontend"], shared dev scripts
tsconfig.base.json         # shared TypeScript compiler options extended by each workspace

backend/
├── package.json
├── src/
│   ├── models/         # Mongoose schemas: Project, Task, TeamMember
│   ├── validation/     # Zod request schemas (shared source of truth for types + validation)
│   ├── services/       # Framework-independent business logic (projects, tasks, teamMembers)
│   ├── api/             # Express routers/controllers — thin, call services only
│   └── app.ts, server.ts
└── tests/
    ├── contract/        # Supertest request/response contract tests per endpoint
    ├── integration/      # Service-level tests against a real/test MongoDB
    └── unit/              # Pure business-logic unit tests (no HTTP, no DB where possible)

frontend/
├── package.json
├── src/
│   ├── components/      # Reusable UI: TaskCard, PriorityBadge, StatusControl, FilterBar, ProgressSummary, etc.
│   ├── pages/            # ProjectsPage, ProjectDetailPage (routed via React Router)
│   ├── api/               # TanStack Query hooks + typed fetch client mirroring backend/contracts/api.md
│   ├── types/             # Shared TS types mirroring the API contracts
│   └── styles/             # Tailwind entry stylesheet + config
└── tests/
    ├── unit/              # Component tests (React Testing Library)
    └── integration/        # Page-level flow tests
```

**Structure Decision**: A single-repo monorepo with `backend/` and `frontend/` as npm workspaces
(Option 2, formalized as a monorepo), because the feature calls for a React frontend and a Node.js
backend as distinct deployable pieces communicating over HTTP, per the constitution's Technology
Stack section and the user's explicit request for a monorepo. npm workspaces (built into npm) is
used instead of a dedicated monorepo tool (Nx, Turborepo) to keep tooling minimal, consistent with
Constitution Principle IX.

## Complexity Tracking

> Not applicable — no Constitution Check violations were identified above.
