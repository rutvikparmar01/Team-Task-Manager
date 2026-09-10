# Quickstart: Project Management

Validates this feature's rules against the acceptance scenarios in `spec.md`, on top of the
existing `001-team-task-management` app (see that feature's `quickstart.md` for full app setup).

## Prerequisite: clean up existing duplicate-named data

Before implementing (adding the unique index), check the target database for existing duplicate
project names created before this feature existed:

```bash
# In mongosh, against the target database:
db.projects.aggregate([
  { $group: { _id: { $toLower: "$name" }, count: { $sum: 1 }, ids: { $push: "$_id" } } },
  { $match: { count: { $gt: 1 } } }
])
```

Rename or delete duplicates found this way — the unique index cannot be created otherwise.
(Verified 2026-09-10: the currently active Atlas database has no duplicates — one project,
"Demo" — so no cleanup was needed at implementation time. Run the check above again before any
future deploy, since it depends on whatever data exists in the target database at that time.)

## Manual validation walkthrough

1. **Valid creation** (User Story 1): Create a project named "Marketing Site" with a description.
   Confirm `201` and that it appears in the project list.
2. **Missing name** (User Story 2): Submit with no name. Confirm `400` and a message that a name
   is required.
3. **Too short** (User Story 2): Submit a 1-2 character name (e.g. "Ab"). Confirm `400` and a
   message that the name is too short.
4. **Too long** (User Story 2): Submit a 101+ character name. Confirm `400` and a message that the
   name is too long.
5. **Boundary lengths accepted** (edge case): Submit exactly 3 characters, then exactly 100.
   Confirm both succeed (`201`).
6. **Exact duplicate** (User Story 3): Attempt to create "Marketing Site" again. Confirm `400` and
   a message that the name is already in use; confirm only one "Marketing Site" exists afterward.
7. **Case/whitespace duplicate** (User Story 3): Attempt "marketing site" and " Marketing Site ".
   Confirm both are rejected as duplicates.
8. **Frontend error visibility**: Repeat steps 2-4 and 6-7 through the UI (not just the API) and
   confirm the specific message is visibly displayed to the user, not just returned by the API.

## Expected outcome

All eight steps behave as described, matching `spec.md`'s acceptance scenarios, and step 8
confirms the frontend actually surfaces server-side validation messages for this feature (not
just the API returning them).
