# Implementation Plan: Task Activity History

**Branch**: `003-task-activity` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-task-activity/spec.md`

## Summary

Add an append-only activity history for tasks: an activity record is created automatically
whenever a task is created, or its status, priority, or assignee changes (skipping no-op
updates), and a task's activity history is displayed newest-first wherever tasks are shown. This
extends the existing `Task` vertical slice (from `001-team-task-management`) with one new
entity (`Activity`), one new read endpoint, and a new expandable section on the existing
`TaskCard` component — it does not introduce a new page/route.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (backend); TypeScript 5.x with React 18
(frontend) — unchanged, reusing the existing monorepo.

**Primary Dependencies**: Unchanged (Express, Mongoose, Zod; React, Vite, React Router, TanStack
Query, Tailwind CSS). No new dependencies — this is additive data + one more query hook.

**Storage**: MongoDB — one new collection, `activities`, referencing the existing `tasks`
collection by `taskId`. No changes to the `Task`, `Project`, or `TeamMember` schemas themselves.

**Testing**: Unchanged — Vitest + Supertest against the existing in-memory MongoDB harness;
Vitest + React Testing Library on the frontend.

**Target Platform**: Unchanged (browser SPA + Vercel Serverless Functions backend, per
constitution v2.1.0's Technology Stack).

**Project Type**: Web application monorepo (existing `backend/` + `frontend/` workspaces) — no
structural change; extends the existing `Task` vertical slice.

**Performance Goals**: Unchanged — demonstration scale.

**Constraints**:
- **UI placement decision**: The spec says activity history is shown on a task's "detail view."
  This app currently has no dedicated per-task page/route — tasks are shown as cards
  (`TaskCard`) within a project's list. Introducing a new route/page purely to host this feature
  would be disproportionate (Constitution Principle IX). This plan instead adds an
  expand/collapse "Activity" section directly to `TaskCard`, fetched lazily (only when expanded)
  so viewing a project's task list doesn't fetch every task's history up front. See research.md
  item 3 for alternatives considered.
- **Pre-existing bug this feature would otherwise inherit**: `backend/src/app.ts`'s error
  handler doesn't catch Mongoose `CastError` (thrown for a malformed ObjectId in a route param),
  so it currently falls through to a generic 500 instead of 400. The new
  `GET /api/tasks/:taskId/activities` endpoint would inherit this exact bug for a malformed
  `taskId`. This plan fixes it at the shared error-handler level (one change, not per-route),
  which also retroactively corrects the same latent issue on every existing route. See
  research.md item 4.
- Multiple fields changing in one `PATCH /api/tasks/:taskId` request (e.g., status and priority
  together) must produce one activity per field that actually changed, not one combined record —
  per spec FR-003/FR-004 treating status and priority as separate activity categories.

**Scale/Scope**: Same small demo scale as the rest of the app.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. TypeScript Everywhere | All new code is TypeScript in the existing workspaces | PASS |
| II. Specification as Source of Truth | Plan derived directly from spec.md; UI-placement gap (no detail page) resolved as a documented plan-level decision, not silently | PASS |
| III. Acceptance Criteria for Every Requirement | Every FR-001..FR-011 in spec.md has acceptance scenarios attached | PASS |
| IV. Input Validation at the API Boundary | Route param validated as a well-formed ObjectId before use (see Constraints); no request body on the new read endpoint | PASS (planned) |
| V. Business Logic Independent of HTTP Layer | New `activityService` holds recording/listing logic; `taskService` calls into it; routes stay thin | PASS (planned) |
| VI. Automated Backend Testing | New contract tests per activity-producing action plus the new GET endpoint, including failure cases | PASS (planned) |
| VII. Reusable, Accessible Frontend Components | New `ActivityList`/`ActivityItem` components, reusable and following the same accessible patterns (semantic list markup, visible focus state on the toggle) as existing components | PASS (planned) |
| VIII. No Unspecified Functionality | Scope limited to spec.md's 11 FRs; comments (dropped from spec) and a dedicated task detail page are explicitly out of scope, not built | PASS |
| IX. Demonstration-Scale Simplicity | One new collection, no new infrastructure; UI placement deliberately avoids a new route (see Constraints) | PASS |
| X. Free and Open-Source Tooling Preference | No new dependencies | PASS |

No violations identified; Complexity Tracking table is not needed.

*Re-checked after Phase 1 design: unchanged — data model and contract stay within the same stack
and scope, so all rows above still hold.*

## Project Structure

### Documentation (this feature)

```text
specs/003-task-activity/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output — new Activity entity
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output — new endpoint + shared error-handler fix
│   └── api.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Extends the existing monorepo — no new top-level structure:

```text
backend/
├── src/
│   ├── models/Activity.ts          # NEW: Activity Mongoose model
│   ├── services/activityService.ts  # NEW: recordActivity, listActivitiesForTask
│   ├── services/taskService.ts       # MODIFY: call activityService after create/update
│   ├── api/tasks.ts                   # MODIFY: add GET /tasks/:taskId/activities
│   └── app.ts                          # MODIFY: map Mongoose CastError to 400 in the error handler
└── tests/
    ├── contract/tasks.activities.test.ts   # NEW: contract tests for the new endpoint
    ├── contract/tasks.post.test.ts          # MODIFY: assert a creation activity is recorded
    ├── contract/tasks.patch.test.ts          # MODIFY: assert activities for status/priority/assignee changes, and none for no-ops
    └── unit/activityService.test.ts           # NEW: service-level tests independent of HTTP

frontend/
├── src/
│   ├── api/activities.ts            # NEW: useTaskActivities(taskId, enabled) query hook
│   ├── components/ActivityList.tsx   # NEW: renders activities, loading/error/empty states
│   ├── components/TaskCard.tsx        # MODIFY: add expand/collapse toggle hosting ActivityList
│   └── types/api.ts                    # MODIFY: add Activity type
└── tests/
    └── unit/ActivityList.test.tsx        # NEW: loading/error/empty/rendering states
```

**Structure Decision**: Extends the existing `Task` vertical slice with one new entity, one new
endpoint, and one new frontend component wired into the existing `TaskCard` — no new routes,
pages, or top-level structure.

## Complexity Tracking

> Not applicable — no Constitution Check violations were identified above.
