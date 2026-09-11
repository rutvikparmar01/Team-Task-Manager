---

description: "Task list for Task Activity History implementation"
---

# Tasks: Task Activity History

**Input**: Design documents from `/specs/003-task-activity/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md,
`.specify/memory/constitution.md`, and the already-shipped `001-team-task-management` codebase
(this feature extends the existing `Task` vertical slice, it does not start from scratch).

**Tests**: Included and required for the backend per Constitution Principle VI. Frontend test
coverage is added for the new `ActivityList` component's loading/error/empty states.

**Organization**: Tasks are grouped by user story per spec.md's priority order (P1: US1, US2;
P2: US3, US4, US5). US3/US4/US5 all modify the same function (`taskService.updateTask`), so —
like `002`'s stories — they are not safely parallelizable against each other despite being
organized by story; this is called out explicitly in Dependencies below.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: US1–US5 per spec.md
- File paths are exact and relative to the repository root

## Path Conventions

Existing monorepo: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`. No new
top-level structure (see plan.md).

---

## Phase 1: Setup

- [x] T001 Confirm no new dependencies are needed for this feature (per research.md — Mongoose
      and Zod already support everything required); run `npm install` at the repository root to
      verify the workspace is still consistent

**Checkpoint**: No dependency changes needed; proceed to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure every user story depends on.

**⚠️ CRITICAL**: No user story work should be considered complete until this phase is done, since
every story's endpoint(s) rely on it.

- [x] T002 Add a `CastError` branch to the centralized error handler in `backend/src/app.ts`,
      mapping a malformed ObjectId (any existing route, not just the new one) to `400` with a
      message like `"<value>" is not a valid id.`, instead of falling through to the generic 500
      handler (research.md item 4; contracts/api.md "Shared fix" section)
- [x] T003 [P] Create the `Activity` Mongoose model in `backend/src/models/Activity.ts` with:
      `taskId` (ref Task, required), `category` (enum `"TaskCreated" | "AssigneeChanged" |
      "StatusChanged" | "PriorityChanged"`, required), `fromStatus`/`toStatus` (enum `"Todo" |
      "In Progress" | "Done"`, "Present only when category is StatusChanged"),
      `fromPriority`/`toPriority` (enum `"Low" | "Medium" | "High"`, "Present only when category
      is PriorityChanged"), `assigneeId` (ref TeamMember, nullable, "Present only when category
      is AssigneeChanged; null represents unassigned"), `createdAt`; plus the compound index
      `{ taskId: 1, createdAt: -1 }` (data-model.md, research.md item 5)
- [x] T004 [P] Create `activityService` in `backend/src/services/activityService.ts` exposing
      only `recordActivity(taskId, category, fields)` (insert) and
      `listActivitiesForTask(taskId)` (find by `taskId`, sort `createdAt` descending) — no
      update/delete function, by construction, per data-model.md's append-only invariant
- [x] T005 [P] Add an `Activity` type to `frontend/src/types/api.ts` mirroring the fields in
      data-model.md

**Checkpoint**: Shared model/service/error-handling ready; user story implementation can begin.

---

## Phase 3: User Story 1 - View a Task's Activity History (Priority: P1)

**Goal**: A task's activity history is viewable, newest first, with correct empty/loading/error
states — independent of whether any activity-producing story below has been implemented yet.

**Independent Test**: View a task's Activity section before any recording exists (or with
recording stubbed) and confirm the empty state renders correctly; confirm loading and error
states render correctly when simulated.

### Tests for User Story 1

- [x] T006 [P] [US1] Contract test: `GET /api/tasks/:taskId/activities` — returns `200 []` for a
      task with no activities; returns `400` for a malformed `taskId`; returns `404` for a
      well-formed but nonexistent `taskId` (FR-005, FR-009, FR-010), in
      `backend/tests/contract/tasks.activities.test.ts` (depends on T002, T004)

### Implementation for User Story 1

- [x] T007 [US1] Implement `GET /api/tasks/:taskId/activities` in `backend/src/api/tasks.ts`,
      calling `activityService.listActivitiesForTask` and mapping `NotFoundError` to 404 (depends
      on T004, T002)
- [x] T008 [P] [US1] Create a `useTaskActivities(taskId, enabled)` TanStack Query hook in
      `frontend/src/api/activities.ts`, using the `enabled` option so it only fetches when the
      caller says so (research.md item 3 — lazy fetch on expand)
- [x] T009 [P] [US1] Create `ActivityList` component in `frontend/src/components/ActivityList.tsx`
      rendering: a loading state, an error state (FR-009), an empty "no activity yet" state
      (FR-008), and otherwise each activity as a plain-language sentence built from its `category`
      and fields (FR-006), with its timestamp (FR-007) — newest first as returned by the API
      (FR-005)
- [x] T010 [US1] Add an expand/collapse "Activity" toggle to `frontend/src/components/
      TaskCard.tsx` that renders `ActivityList` using `useTaskActivities(task._id, isExpanded)`
      only while expanded (depends on T008, T009)
- [x] T011 [P] [US1] Add tests to `frontend/tests/unit/ActivityList.test.tsx` covering the
      loading, error, and empty states, and one rendered activity's plain-language text (depends
      on T009)

**Checkpoint**: Activity history is viewable end-to-end (against an empty/seeded data set),
independent of the recording stories below.

---

## Phase 4: User Story 2 - Record Activity on Task Creation (Priority: P1)

**Goal**: Creating a task records exactly one `TaskCreated` activity.

**Independent Test**: Create a task and confirm its activity history contains exactly one entry
describing its creation, timestamped at creation time.

### Tests for User Story 2

- [x] T012 [P] [US2] Extend `backend/tests/contract/tasks.post.test.ts`: creating a task results
      in exactly one `TaskCreated` activity for it, timestamped at creation (FR-001, spec User
      Story 2)

### Implementation for User Story 2

- [x] T013 [US2] In `taskService.createTask` (`backend/src/services/taskService.ts`), call
      `activityService.recordActivity(task._id, "TaskCreated", {})` after the task is
      successfully created (depends on T004)

**Checkpoint**: Every newly created task has exactly one activity; combined with User Story 1,
this is the minimal demonstrable slice (create a task, see its history).

---

## Phase 5: User Story 3 - Record Activity on Status Change (Priority: P2)

**Goal**: A task's status change is recorded, and a no-op status update is not.

**Independent Test**: Change a task's status and confirm a `StatusChanged` activity appears with
the correct previous/new values; set it to its current value and confirm no activity appears.

### Tests for User Story 3

- [x] T014 [P] [US3] Extend `backend/tests/contract/tasks.patch.test.ts`: a status change
      produces a `StatusChanged` activity with the correct `fromStatus`/`toStatus`; setting status
      to its current value produces no new activity (FR-003 and its edge case)

### Implementation for User Story 3

- [x] T015 [US3] In `taskService.updateTask`, before applying `input.status`, compare it to the
      task's current status; if different, call `activityService.recordActivity(taskId,
      "StatusChanged", { fromStatus, toStatus })` after saving (depends on T004; **same function
      as T017/T019 — implement together, see Dependencies**)

**Checkpoint**: Status changes are recorded correctly, independent of priority/assignment
recording.

---

## Phase 6: User Story 4 - Record Activity on Priority Change (Priority: P2)

**Goal**: A task's priority change is recorded, and a no-op priority update is not.

**Independent Test**: Change a task's priority and confirm a `PriorityChanged` activity appears
with the correct previous/new values; set it to its current value and confirm no activity
appears.

### Tests for User Story 4

- [x] T016 [P] [US4] Extend `backend/tests/contract/tasks.patch.test.ts`: a priority change
      produces a `PriorityChanged` activity with the correct `fromPriority`/`toPriority`; setting
      priority to its current value produces no new activity (FR-004 and its edge case)

### Implementation for User Story 4

- [x] T017 [US4] In `taskService.updateTask`, before applying `input.priority`, compare it to the
      task's current priority; if different, call `activityService.recordActivity(taskId,
      "PriorityChanged", { fromPriority, toPriority })` after saving (depends on T004; **same
      function as T015/T019 — implement together, see Dependencies**)

**Checkpoint**: Priority changes are recorded correctly, independent of status/assignment
recording.

---

## Phase 7: User Story 5 - Record Activity on Assignment Change (Priority: P2)

**Goal**: A task's assignee changing — first assignment, reassignment, or unassignment — is
recorded.

**Independent Test**: Assign, reassign, and unassign a task, confirming an `AssigneeChanged`
activity appears each time, naming the team member involved (or indicating unassignment).

### Tests for User Story 5

- [x] T018 [P] [US5] Extend `backend/tests/contract/tasks.patch.test.ts`: assigning, reassigning,
      and unassigning a task each produce an `AssigneeChanged` activity with the correct
      `assigneeId` (or `null` for unassignment) (FR-002, spec User Story 5)

### Implementation for User Story 5

- [x] T019 [US5] In `taskService.updateTask`, before applying `input.assigneeId`, compare it to
      the task's current `assigneeId`; if different, call `activityService.recordActivity(taskId,
      "AssigneeChanged", { assigneeId })` after saving (depends on T004; **same function as
      T015/T017 — implement together, see Dependencies**)

**Checkpoint**: All four recording stories (US2, US3, US4, US5) plus viewing (US1) work together.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T020 [P] Add unit tests in `backend/tests/unit/activityService.test.ts` covering
      `recordActivity`/`listActivitiesForTask` directly (ordering newest-first, no
      update/delete function exists), independent of HTTP (Constitution Principle V/VI)
- [x] T021 Run the full 9-step `quickstart.md` walkthrough end-to-end against the running app,
      including the malformed-id (400) and unknown-task (404) checks (steps 1-6, 8-9 verified
      live via curl against MongoDB Atlas; step 7's visual error-state confirmation in a browser
      wasn't possible in this environment — no browser tool available — but is covered by
      `ActivityList`'s component tests, T011)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Blocks all user stories — the `Activity` model/service and the
  shared `CastError` fix are needed by every story's endpoint.
- **User Story 1 (Phase 3)**: Depends only on Foundational; independently testable with an empty
  or manually-seeded activity list.
- **User Story 2 (Phase 4)**: Depends only on Foundational; independently testable.
- **User Stories 3, 4, 5 (Phases 5–7)**: All depend on Foundational, and **all three modify the
  same function** (`taskService.updateTask`) — they are not safely parallelizable against each
  other despite being organized as separate stories. Implement T015, T017, T019 as one combined
  edit to `updateTask`, then verify each story's tests (T014, T016, T018) independently.
- **Polish (Phase 8)**: Depends on all five stories being complete.

### Parallel Opportunities

- All Foundational tasks marked `[P]` (T003, T004, T005) can run in parallel after T002.
- Within User Story 1: T008 and T009 (different files) can run in parallel; T006 (test) can be
  written in parallel with T007 (implementation) though it should be verified against it before
  being considered complete.
- User Story 1 and User Story 2 can be built in parallel by different people, since neither
  depends on the other.
- User Stories 3/4/5's *tests* (T014, T016, T018 — different describe blocks in the same file)
  can be written in parallel; their *implementation* (T015/T017/T019) cannot, per above.

---

## Implementation Strategy

### Recommended order

1. Phase 1 + Phase 2 (Foundational) — required before anything else.
2. User Story 1 (Phase 3) and User Story 2 (Phase 4) — can proceed in parallel; together they
   form the minimal demonstrable slice (create a task, see its one activity).
3. User Stories 3, 4, 5 (Phases 5–7) — implement together in one pass through
   `taskService.updateTask` (they share the same function), then verify each story's tests pass
   independently.
4. Phase 8 — polish and the full manual walkthrough.

---

## Notes

- Unlike `001`, User Stories 3/4/5 here are not independently implementable in parallel with each
  other — they share one function. They remain organized as separate stories for traceability
  back to spec.md's FR-003/FR-004/FR-002, not because the code is structured that way.
- T002 (the `CastError` fix) is a small, contained correctness fix that also retroactively
  corrects existing routes, not scope creep — see plan.md's Constraints and research.md item 4.
- Commit after each task or logical group.
