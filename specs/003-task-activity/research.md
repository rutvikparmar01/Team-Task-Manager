# Phase 0 Research: Task Activity History

## 1. Activity record shape

**Decision**: Explicit, typed optional fields per category, not a generic `metadata` blob:
`category` (`"TaskCreated" | "AssigneeChanged" | "StatusChanged" | "PriorityChanged"`), plus
`fromStatus`/`toStatus` (only for `StatusChanged`), `fromPriority`/`toPriority` (only for
`PriorityChanged`), and `assigneeId` (only for `AssigneeChanged`, nullable to represent
"unassigned").

**Rationale**: Every other model in this codebase (`Task`, `Project`, `TeamMember`) uses explicit
typed fields rather than a loosely-typed metadata object, and TypeScript can enforce the
category/field pairing at the point of construction. `assigneeId` reuses the existing
`TeamMember` reference pattern already used on `Task` — the frontend resolves the display name
from the same `useTeamMembers()` list it already loads, rather than denormalizing a name onto
the activity record.

**Alternatives considered**: A generic `metadata: Record<string, unknown>` field (matches the
original informal draft) — rejected as a style inconsistency with the rest of the codebase and
losing compile-time field/category correctness. Denormalizing `assigneeName` onto the activity —
rejected as redundant, never-updated data alongside a reference that already resolves cleanly.

## 2. Where human-readable formatting happens

**Decision**: The backend returns structured data (category + relevant fields); the frontend
turns that into a plain-language sentence via a small pure function in the new `ActivityList`
component (e.g., `"Status changed from Todo to In Progress"`).

**Rationale**: Matches how the rest of the app already works — `PriorityBadge`/`StatusControl`
render based on raw enum values, not pre-formatted strings from the backend. Keeps `activityService`
focused on data and business rules (Constitution Principle V), and keeps presentation wording a
frontend concern (easier to change copy without touching the API).

**Alternatives considered**: Backend-generated description strings — rejected; would couple
display wording to the API contract and duplicate what's naturally a presentation-layer concern.

## 3. Where activity history is shown (no dedicated task detail page exists)

**Decision**: An expand/collapse "Activity" section added directly to the existing `TaskCard`
component, lazily fetched via TanStack Query only when expanded (`enabled: isExpanded`).

**Rationale**: The spec's "task detail view" language predates knowing this app has no per-task
route — tasks are only ever shown as cards within a project's task list. Adding a new route
solely to host this feature would be new routing/page-structure scope the spec doesn't actually
require and the constitution's demonstration-scale-simplicity principle argues against. Lazy
fetching (only on expand) avoids fetching every visible task's full history on every project
page load, which would scale poorly even at demo size once a project has more than a few tasks.

**Alternatives considered**: A new `/projects/:projectId/tasks/:taskId` route with a dedicated
detail page — more faithful to the original "detail view" wording, but a materially bigger
change (new route, new page component, navigation changes) for what the spec's actual functional
requirements need. Rejected for this feature; could be revisited later if the app grows a real
need for a task detail page beyond just hosting activity history. Eagerly fetching all tasks'
activities alongside the task list — rejected as unnecessary upfront cost per Principle IX.

## 4. Malformed task ID handling (bonus fix, not new scope)

**Decision**: Add a `CastError` branch to `backend/src/app.ts`'s centralized error handler,
mapping it to `400` with a clear message, instead of leaving it to fall through to the generic
500 handler.

**Rationale**: The new `GET /api/tasks/:taskId/activities` endpoint takes a `taskId` route param
exactly like the existing `PATCH /api/tasks/:taskId`, which already has this latent bug (a
malformed ObjectId throws an uncaught Mongoose `CastError`, currently surfacing as 500). Fixing
it once in the shared error handler is simpler than adding per-route ID validation, and
retroactively corrects the same bug on every existing route that takes an ID param — a small,
clearly-scoped correctness fix, not new user-facing functionality.

**Alternatives considered**: Adding a Zod regex check for a 24-char hex string on each route
param individually — works, but is more code duplicated across every ID-taking route for the
same outcome the shared error handler already achieves in one place.

## 5. Indexing

**Decision**: A compound index `{ taskId: 1, createdAt: -1 }` on the `activities` collection.

**Rationale**: Every query is "find activities for this task, newest first" — a compound index
serves both the filter and the sort in one index, matching the spec's own explicit performance
requirement that activities be indexed by `taskId`.

**Alternatives considered**: A single-field index on `taskId` alone — would still require an
in-memory sort on `createdAt` for every query; the compound index avoids that at negligible extra
cost.
