# API Contract Delta: Project Management

This is a **delta** to `specs/001-team-task-management/contracts/api.md`. Only the two `Project`
endpoints affected by this feature are shown; every other endpoint (`Task`, `TeamMember`, project
progress) is unchanged — see the `001` contract for those.

## `POST /api/projects` (updated)

Body:
```json
{ "name": "string (required, 3-100 chars after trimming)", "description": "string (optional)" }
```
→ `201` with the created project.
→ `400` if `name` is missing/blank (unchanged from `001`), **or** shorter than 3 characters after
trimming, **or** longer than 100 characters after trimming, **or** matches an existing project's
name case-insensitively after trimming.

Error messages are specific to the reason (per FR-005 of `002-project-management/spec.md`):
```json
{ "message": "Project name must be at least 3 characters." }
{ "message": "Project name must be at most 100 characters." }
{ "message": "A project named \"Marketing Site\" already exists." }
```

Satisfies: FR-001–FR-008 of `specs/002-project-management/spec.md`.

## `GET /api/projects` (unchanged)

No change to this endpoint's request/response shape — included here only to note that its
results now reflect the updated uniqueness/length guarantees on every returned project.
