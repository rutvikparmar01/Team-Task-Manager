# Quickstart: Task Activity History

Validates this feature against the acceptance scenarios in `spec.md`, on top of the existing app
(see `specs/001-team-task-management/quickstart.md` for full app setup).

## Manual validation walkthrough

1. **Empty state** (User Story 1): Create a new task, expand its Activity section before doing
   anything else — confirm it shows exactly one entry (the creation, from step 2), not an empty
   state (a brand-new task always has at least its creation activity — see step 2).
2. **Task creation recorded** (User Story 2): Create a task named "Write report". Expand its
   Activity section. Confirm exactly one entry appears, reading as a plain-language description
   of its creation, timestamped at creation time.
3. **Status change recorded** (User Story 3): Move that task from Todo → In Progress. Confirm a
   new activity appears reading "Status changed from Todo to In Progress". Set it to "In
   Progress" again (same value) — confirm no new activity appears.
4. **Priority change recorded** (User Story 4): Change the task's priority from Medium to High.
   Confirm a new activity appears reading "Priority changed from Medium to High". Set it to
   "High" again — confirm no new activity appears.
5. **Assignment change recorded** (User Story 5): Assign the task to a team member. Confirm a new
   activity appears naming that team member. Reassign it to a different team member — confirm
   another activity appears naming the new one. Unassign it — confirm an activity appears
   indicating it's now unassigned.
6. **Ordering**: Confirm all activities recorded above appear newest-first when the Activity
   section is viewed.
7. **Error state**: Temporarily stop the backend (or point the frontend at an unreachable API),
   expand a task's Activity section, and confirm a clear error message is shown rather than a
   blank or stuck-loading section.
8. **Malformed ID handling**: `curl` (or similar) `GET /api/tasks/not-an-id/activities` directly
   and confirm a `400` response, not a `500`.
9. **Unknown task**: `GET /api/tasks/<a well-formed but nonexistent ObjectId>/activities` and
   confirm a `404` response.

## Expected outcome

All nine steps behave as described, matching spec.md's acceptance scenarios and edge cases, with
no activity ever created for a status/priority update that doesn't actually change the value.
