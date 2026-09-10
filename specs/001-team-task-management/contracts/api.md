# API Contract: Team Task Management

All endpoints are prefixed with `/api`. All request bodies are validated with Zod schemas at the
boundary (Constitution Principle IV); invalid input returns `400` with a `message` field naming
the specific problem (spec FR-018). All responses are JSON.

Team-member endpoints reflect the Phase 0 default in `research.md` item 7, which is **not yet
confirmed by the user** — if free-text assignment is chosen instead, the `TeamMember` endpoints
are dropped and `assigneeId` becomes `assigneeName: string` on Task endpoints.

## Error shape (all endpoints)

```json
{ "message": "Project name is required." }
```
`400` — validation failure. `404` — referenced resource (project/task/team member) does not exist.

## Projects

### `GET /api/projects`
Returns all projects. → `200`
```json
[{ "id": "…", "name": "…", "description": "…", "createdAt": "…" }]
```
Satisfies: FR-003, User Story 1.

### `POST /api/projects`
Body:
```json
{ "name": "string (required, non-blank)", "description": "string (optional)" }
```
→ `201` with the created project. → `400` if `name` missing/blank (FR-002).
Satisfies: FR-001, FR-002, User Story 1.

### `GET /api/projects/:projectId/progress`
→ `200`
```json
{ "totalTasks": 4, "doneTasks": 1, "progress": 0.25 }
```
or, when `totalTasks` is 0:
```json
{ "totalTasks": 0, "doneTasks": 0, "progress": null }
```
→ `404` if `projectId` does not exist.
Satisfies: FR-015, FR-016, User Story 5.

## Tasks

### `GET /api/projects/:projectId/tasks`
Query params (optional): `status` (`Todo` | `In Progress` | `Done`), `priority` (`Low` | `Medium` |
`High`). Both may be supplied together.
→ `200` — tasks belonging to `projectId` matching any supplied filters (empty array, not an
error, when none match). → `404` if `projectId` does not exist.
```json
[{ "id": "…", "projectId": "…", "title": "…", "description": "…", "priority": "Medium", "status": "Todo", "assigneeId": null, "createdAt": "…" }]
```
Satisfies: FR-006, FR-013, FR-014, User Stories 2 and 4.

### `POST /api/projects/:projectId/tasks`
Body:
```json
{
  "title": "string (required, non-blank)",
  "description": "string (optional)",
  "priority": "Low | Medium | High (optional, defaults to Medium)",
  "assigneeId": "string (optional, must reference an existing team member)"
}
```
→ `201` with the created task (`status` always `"Todo"`). → `400` if `title` missing/blank, or if
`priority`/`assigneeId` is present but invalid. → `404` if `projectId` does not exist.
Satisfies: FR-004, FR-005, FR-007–FR-011, User Story 2.

### `PATCH /api/tasks/:taskId`
Body (all fields optional, at least one required):
```json
{ "status": "Todo | In Progress | Done", "priority": "Low | Medium | High", "assigneeId": "string | null" }
```
→ `200` with the updated task. → `400` if an invalid enum value is supplied or the body is empty.
→ `404` if `taskId` (or a supplied `assigneeId`) does not exist.
Satisfies: FR-008, FR-009, FR-012, User Story 3.

## Team Members

### `GET /api/team-members`
→ `200`
```json
[{ "id": "…", "name": "…", "createdAt": "…" }]
```

### `POST /api/team-members`
Body:
```json
{ "name": "string (required, non-blank)" }
```
→ `201` with the created team member. → `400` if `name` missing/blank.
Satisfies: spec Edge Case — assigning when no team members exist yet.
