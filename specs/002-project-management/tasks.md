---

description: "Task list for Project Management implementation"
---

# Tasks: Project Management

**Input**: Design documents from `/specs/002-project-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md,
`.specify/memory/constitution.md`, and the already-shipped `001-team-task-management` codebase
(this feature modifies it, it does not start from scratch).

**Tests**: Included and required for the backend per Constitution Principle VI. Frontend test
coverage is added for the one piece of new frontend behavior this feature needs (error display).

**Organization**: Tasks are grouped by user story per spec.md's priority order. Because all three
stories touch the same `Project` vertical slice (unlike `001`'s more independent stories), later
stories build directly on earlier ones' files rather than being fully parallel-safe across stories
— this is called out explicitly where it applies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: US1/US2/US3 per spec.md
- File paths are exact and relative to the repository root

## Path Conventions

Existing monorepo from `001`: `backend/src/`, `backend/tests/`, `frontend/src/`,
`frontend/tests/`. No new top-level structure (see plan.md).

---

## Phase 1: Setup

**Purpose**: Confirm no new tooling is needed (per research.md, this feature needs zero new
dependencies — Zod `.min()`/`.max()` and Mongoose `minlength`/`maxlength`/collation indexes are
already available in the existing toolchain).

- [x] T001 Confirm `backend/package.json` and `frontend/package.json` require no new dependencies
      for this feature; run `npm install` at the repository root to verify the workspace is still
      consistent

**Checkpoint**: No dependency changes needed; proceed directly to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: A one-time data-cleanup step that MUST happen before the unique index in User Story
3 can be safely added to a database that already has demo data in it.

**⚠️ CRITICAL**: This blocks deploying/merging User Story 3's index change, though it does not
block writing or testing the code for any story (the automated test suite uses a fresh in-memory
database on every run, so it is unaffected).

- [x] T002 Run the duplicate-detection query from `quickstart.md` against the real target
      MongoDB (Atlas) database and rename or delete any existing case-insensitive duplicate
      project names (this project's own database is known to have one: "Demo Project", created
      twice during earlier manual testing) — manual/operational step, no source file changes

**Checkpoint**: Real database has no duplicate names remaining; safe to add the unique index
(User Story 3) to it whenever that change is deployed.

---

## Phase 3: User Story 1 - Create a Project with Valid Details (Priority: P1)

**Goal**: Confirm the already-shipped creation flow (from `001-team-task-management`) still
works correctly — this user story's functionality **already exists in the codebase**; no new
implementation is needed here, only regression verification as the safety net for the changes in
User Stories 2 and 3.

**Independent Test**: Create a project with a valid name and description, and one with a valid
name and no description; confirm both succeed and appear in the project list.

- [x] T003 [US1] Confirm `backend/tests/contract/projects.post.test.ts`'s existing "creates a
      project with a valid name" case and `backend/tests/contract/projects.get.test.ts`'s listing
      test still pass unmodified after User Stories 2 and 3 land (no code change expected; this is
      a checkpoint, not new test-writing)

**Checkpoint**: Valid-creation behavior is unchanged and still passing.

---

## Phase 4: User Story 2 - Reject Invalid Project Names (Priority: P2)

**Goal**: A name that's missing, under 3 characters, or over 100 characters (after trimming) is
rejected with a message identifying which of those three reasons applies, and no project is
created.

**Independent Test**: Submit blank, 1-2 character, and 101+ character names; confirm each is
rejected with a distinct message and no project is added to the list.

### Tests for User Story 2

- [x] T004 [P] [US2] Extend `backend/tests/contract/projects.post.test.ts` with: a 1-2 character
      name rejected with a "too short" message; a 101+ character name rejected with a "too long"
      message; a name of exactly 3 characters and exactly 100 characters, both accepted (FR-003,
      FR-004, spec Edge Cases)

### Implementation for User Story 2

- [x] T005 [P] [US2] Extend the `name` field in `backend/src/validation/project.ts`'s Zod schema
      with `.min(3, "Project name must be at least 3 characters.")` and
      `.max(100, "Project name must be at most 100 characters.")`, applied after `.trim()`
- [x] T006 [P] [US2] Add `minlength: 3` and `maxlength: 100` to the `name` field in
      `backend/src/models/Project.ts` as a defense-in-depth backstop (depends on T005 existing as
      the primary boundary check)
- [x] T007 [US2] Wire `frontend/src/api/projects.ts`'s `useCreateProject` mutation's rejection
      into `frontend/src/components/CreateProjectForm.tsx`'s existing `role="alert"` element, so
      any server-rejected create (length, and later duplicate) is visibly displayed — not just the
      pre-existing client-side blank-name check (research.md item 4; satisfies this spec's SC-002)
      (depends on T005)
- [x] T008 [US2] Add a test to `frontend/tests/unit/CreateProjectForm.test.tsx` asserting a
      rejected `useCreateProject` mutation renders its message in the alert (mock the mutation as
      rejected; depends on T007)

**Checkpoint**: Length validation works end-to-end (API + visible UI error), independent of User
Story 3.

---

## Phase 5: User Story 3 - Reject Duplicate Project Names (Priority: P3)

**Goal**: A project name that duplicates an existing one — including case-only or
whitespace-only differences — is rejected with a specific message, and no second project is
created.

**Independent Test**: Create "Marketing Site", then attempt "Marketing Site" again, then
"marketing site", then " Marketing Site "; confirm all three are rejected and only one project
exists afterward.

### Tests for User Story 3

- [x] T009 [P] [US3] Extend `backend/tests/contract/projects.post.test.ts` with: an exact-name
      duplicate rejected with an "already exists" message; a case-different duplicate rejected;
      a whitespace-different duplicate rejected (FR-005, spec User Story 3)
- [x] T010 [P] [US3] Add a unit test in `backend/tests/unit/projectService.test.ts` asserting
      `projectService.createProject` throws a `ValidationError` for a case/whitespace-variant
      duplicate, independent of HTTP (Constitution Principle V/VI)
- [x] T011 [US3] Update `backend/tests/contract/projects.get.test.ts`: remove the now-obsolete
      "allows two projects with the same name" test from `001` (directly contradicted by this
      feature's uniqueness rule — see the amended Edge Case in
      `specs/001-team-task-management/spec.md`)

### Implementation for User Story 3

- [x] T012 [US3] Add a case-insensitive duplicate pre-check to `projectService.createProject` in
      `backend/src/services/projectService.ts`: query for an existing project whose trimmed name
      matches case-insensitively, and throw `ValidationError('A project named "..." already
      exists.')` before attempting the insert (research.md item 2) (depends on T006)
- [x] T013 [US3] Catch a MongoDB duplicate-key error (code `11000`) in the same
      `createProject` as a backstop for the race window between the pre-check and the insert,
      mapping it to the same `ValidationError` (depends on T012)
- [x] T014 [US3] Add the collation-aware unique index to `backend/src/models/Project.ts`'s schema
      (`{ name: 1 }`, `unique: true`, `collation: { locale: "en", strength: 2 }`) (depends on
      T002 having been run against any pre-existing real database before this ships there)
- [x] T015 [US3] Add a test to `frontend/tests/unit/CreateProjectForm.test.tsx` asserting a
      duplicate-name rejection (mocked) renders through the same alert wired in T007 — no new
      frontend code expected, this is verification that the generic wiring from User Story 2
      already covers this case (depends on T007)

**Checkpoint**: All three user stories (valid creation, length validation, uniqueness) work
together; `001`'s obsolete duplicate-allowed test is gone.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T016 Run the full 8-step `quickstart.md` walkthrough end-to-end against the running app,
      including confirming T002's real-database cleanup was actually applied (steps 1-7 verified
      live against MongoDB Atlas via curl; step 8's visual confirmation in a browser was not
      possible in this environment — no browser tool available — but is covered by the
      CreateProjectForm component tests added in T008/T015)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — confirms no new tooling needed.
- **Foundational (Phase 2)**: An operational prerequisite for deploying User Story 3's index
  change to any database with existing data; does not block writing/testing code for any story.
- **User Story 1 (Phase 3)**: No new code — a regression checkpoint only, can run anytime.
- **User Story 2 (Phase 4)**: Depends on Foundational being acknowledged; introduces the generic
  frontend error-wiring that User Story 3 also relies on.
- **User Story 3 (Phase 5)**: Depends on User Story 2's validation schema changes (T005/T006) and
  frontend wiring (T007) already existing — **unlike `001`, these stories are not independently
  parallelizable across each other**, because they modify the same `name` field and the same
  error-display path in sequence.
- **Polish (Phase 6)**: Depends on all three stories being complete.

### Parallel Opportunities

- Within User Story 2: T004 (test) and T005/T006 (implementation) touch different files and can
  be written in parallel, though the test should be run against the implementation before being
  considered complete (standard test-then-verify, not strict TDD ordering).
- Within User Story 3: T009 and T010 (different test files) can run in parallel; T012→T013→T014
  are sequential (same file / logically dependent).

---

## Implementation Strategy

### Recommended order

1. Phase 1 (confirm no setup needed) + Phase 2 (clean up real database) — can happen anytime,
   including in parallel with development, since neither blocks writing code.
2. User Story 2 (Phase 4) — establishes both the length rule and the generic frontend
   error-wiring that User Story 3 reuses.
3. User Story 3 (Phase 5) — adds uniqueness on top of User Story 2's foundation.
4. User Story 1 (Phase 3) — run as a final regression checkpoint (it has no new code, so it can
   also be checked continuously throughout, not just at the end).
5. Phase 6 — full manual walkthrough.

---

## Notes

- This feature has an unusual shape compared to `001`: it modifies existing, already-shipped code
  rather than adding new files, and its three user stories are sequentially dependent rather than
  independently parallelizable, because they all touch the same `Project.name` field and the same
  error-display path. This is called out explicitly rather than forcing the stories into an
  artificial independence they don't have.
- T011 (removing `001`'s now-obsolete "duplicate names allowed" test) is a required part of this
  feature, not an unrelated cleanup — leaving it in place would mean the test suite still asserts
  behavior this feature explicitly reverses.
- Commit after each task or logical group.
