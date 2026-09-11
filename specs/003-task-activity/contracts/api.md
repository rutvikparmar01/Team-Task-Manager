# API Contract Delta: Task Activity History

Delta to `specs/001-team-task-management/contracts/api.md`. Only the new endpoint and one
shared cross-cutting fix are described here; every other endpoint is unchanged.

## `GET /api/tasks/:taskId/activities` (new)

→ `200` — that task's activities, newest first (empty array, not an error, when there are none):
```json
[
  { "id": "…", "taskId": "…", "category": "TaskCreated", "createdAt": "…" },
  { "id": "…", "taskId": "…", "category": "StatusChanged", "fromStatus": "Todo", "toStatus": "In Progress", "createdAt": "…" },
  { "id": "…", "taskId": "…", "category": "PriorityChanged", "fromPriority": "Medium", "toPriority": "High", "createdAt": "…" },
  { "id": "…", "taskId": "…", "category": "AssigneeChanged", "assigneeId": "…", "createdAt": "…" }
]
```
→ `400` if `taskId` is not a well-formed identifier (see the shared error-handler fix below).
→ `404` if `taskId` is well-formed but no such task exists (FR-010).

Satisfies: FR-005–FR-010, User Story 1.

## Shared fix: malformed ID → 400 (all existing ID-taking routes)

Previously, a malformed `:projectId`/`:taskId` (not a valid ObjectId) caused an uncaught Mongoose
`CastError`, surfacing as an undifferentiated `500`. As of this feature, the centralized error
handler in `backend/src/app.ts` maps `CastError` to:
```json
{ "message": "\"<value>\" is not a valid id." }
```
with status `400`. This applies to every existing route that takes an ID path param
(`GET/PATCH /api/tasks/:taskId`, `GET /api/projects/:projectId/*`), not just the new endpoint —
see research.md item 4 and plan.md's Constraints.

## Side effects on existing endpoints (no request/response shape change)

- `POST /api/projects/:projectId/tasks` now also creates a `TaskCreated` activity (FR-001).
- `PATCH /api/tasks/:taskId` now also creates zero or more activities depending on which fields
  actually changed (FR-002–FR-004): none for a no-op status/priority update, one `StatusChanged`
  if status actually changed, one `PriorityChanged` if priority actually changed, one
  `AssigneeChanged` if assignee actually changed. The task response shape itself is unchanged.
