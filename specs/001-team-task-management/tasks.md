---

description: "Task list for Team Task Management implementation"
---

# Tasks: Team Task Management

**Input**: Design documents from `/specs/001-team-task-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md,
`.specify/memory/constitution.md`

**Tests**: Included and required — Constitution Principle VI ("All backend functionality...MUST
have automated tests covering its expected behavior, including at least one failure/invalid-input
case per endpoint") makes backend tests mandatory, not optional. Frontend component tests are
included for the same reusable components the constitution's Principle VII calls out.

**Organization**: Tasks are grouped by user story (from spec.md, in priority order) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- File paths are exact and relative to the repository root

## Path Conventions

Monorepo web app per plan.md: `backend/src/`, `backend/tests/`, `frontend/src/`,
`frontend/tests/`, with a root `package.json` declaring both as npm workspaces.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo initialization and tooling, per plan.md Project Structure and research.md
items 4, 5a, 6, 8.

- [x] T001 Create root `package.json` with `"workspaces": ["backend", "frontend"]` and a root
      `tsconfig.base.json` with shared strict TypeScript compiler options, at repository root
- [x] T002 [P] Initialize `backend/package.json` (TypeScript, Express, Mongoose, Zod, Vitest,
      Supertest, ts-node/tsx) and `backend/tsconfig.json` extending `../tsconfig.base.json`
- [x] T003 [P] Initialize `frontend/package.json` (React, React DOM, Vite, TypeScript, React
      Router, TanStack Query, Tailwind CSS, Vitest, React Testing Library, jsdom) and
      `frontend/tsconfig.json` extending `../tsconfig.base.json`, plus `frontend/vite.config.ts`
- [x] T004 [P] Configure Tailwind CSS: `frontend/tailwind.config.ts`, `frontend/postcss.config.js`,
      and `frontend/src/styles/index.css` with the `@tailwind base/components/utilities`
      directives, imported once from the app entry point
- [x] T005 [P] Add root ESLint + Prettier configuration covering both workspaces
      (`.eslintrc.cjs` or `eslint.config.js`, `.prettierrc`) at repository root
- [x] T006 [P] Add `backend/.env.example` documenting `MONGODB_URI` and `PORT` (no real
      credentials committed) and root `.gitignore` covering `node_modules/`, `dist/`, `.env*`

**Checkpoint**: Both workspaces install and build with an empty entry point; no functionality yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core app scaffolding that every user story's backend and frontend work depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create Express app skeleton with JSON body-parsing middleware and a centralized error
      handler that returns the `{ "message": "..." }` error shape from `contracts/api.md` for
      validation (400) and not-found (404) errors, in `backend/src/app.ts` and
      `backend/src/server.ts`
- [x] T008 Create MongoDB connection module using Mongoose and the `MONGODB_URI` environment
      variable, in `backend/src/db.ts`, called on server startup from `backend/src/server.ts`
      (depends on T007)
- [x] T009 [P] Create the React app shell with `BrowserRouter` (React Router) and a TanStack Query
      `QueryClientProvider` wrapping the app, in `frontend/src/main.tsx` and `frontend/src/App.tsx`
- [x] T010 [P] Create a typed API client base with configurable base URL and a JSON fetch wrapper
      that parses the `{ "message": "..." }` error shape from `contracts/api.md` into a thrown
      error, in `frontend/src/api/client.ts`
- [x] T011 [P] Create shared frontend TS types mirroring the request/response shapes in
      `contracts/api.md` (Project, Task, TeamMember, Progress, filter params) in
      `frontend/src/types/api.ts`
- [x] T011a [P] Create the backend test-database harness (`mongodb-memory-server`, started/stopped
      in a Vitest global setup) plus `backend/vitest.config.ts`, so every contract/integration test
      runs against a real, isolated MongoDB instance, in `backend/tests/setup.ts` and
      `backend/vitest.config.ts`
- [x] T011b [P] Create `frontend/vitest.config.ts` (implemented as a `test` block inside
      `frontend/vite.config.ts`, Vitest's supported equivalent to a standalone config file) (jsdom environment) and
      `frontend/tests/setup.ts` (React Testing Library `jest-dom` matchers) so component tests can
      run

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Create and View Projects (Priority: P1) 🎯 MVP

**Goal**: A user can create a project and see it listed alongside any other projects.

**Independent Test**: Create a project via the UI (or API) and confirm it appears in the projects
list; submit the create form with a blank name and confirm a specific validation message appears.

### Tests for User Story 1

- [x] T012 [P] [US1] Contract test: `POST /api/projects` — creating with a valid `name` returns
      201 with the created project; omitting or blanking `name` returns 400 with a message stating
      a name is required (data-model.md: "Required; trimmed; rejected if empty/whitespace-only
      (FR-002)"), in `backend/tests/contract/projects.post.test.ts`
- [x] T013 [P] [US1] Contract test: `GET /api/projects` — returns all created projects, in
      `backend/tests/contract/projects.get.test.ts`

### Implementation for User Story 1

- [x] T014 [P] [US1] Create `Project` Mongoose model in `backend/src/models/Project.ts` with
      `name: string` ("Required; trimmed; rejected if empty/whitespace-only"), `description:
      string` (optional), `createdAt` ("Set on creation; not user-editable"), per data-model.md
- [x] T015 [P] [US1] Create Zod schema for project creation (`name`: `z.string().trim().min(1)` so
      a whitespace-only value is rejected the same as an empty one, per spec.md Edge Cases;
      `description` optional string) in `backend/src/validation/project.ts`
- [x] T016 [US1] Implement `projectService` with `createProject` and `listProjects` in
      `backend/src/services/projectService.ts` (no Express types imported, per Constitution
      Principle V) (depends on T014)
- [x] T017 [US1] Implement `GET /api/projects` and `POST /api/projects` in
      `backend/src/api/projects.ts`, validating input with the T015 schema before calling
      `projectService`, mounted under `/api` in `backend/src/app.ts` (depends on T015, T016, T007)
- [x] T018 [P] [US1] Unit test for `projectService.createProject`/`listProjects` business logic,
      independent of HTTP, in `backend/tests/unit/projectService.test.ts` (depends on T016)
- [x] T019 [P] [US1] Create TanStack Query hooks `useProjects` (list) and `useCreateProject`
      (mutation, invalidating the projects list on success) in `frontend/src/api/projects.ts`
      (depends on T010, T011)
- [x] T020 [P] [US1] Create reusable `ProjectCard` component (props-driven, semantic markup) in
      `frontend/src/components/ProjectCard.tsx`
- [x] T021 [P] [US1] Create `CreateProjectForm` component with a labeled name input, inline
      validation message on submit-with-blank-name, and visible focus states, in
      `frontend/src/components/CreateProjectForm.tsx`
- [x] T022 [US1] Create `ProjectsPage` assembling the projects list (`ProjectCard` per project) and
      `CreateProjectForm`, wired to `useProjects`/`useCreateProject`, in
      `frontend/src/pages/ProjectsPage.tsx` (depends on T019, T020, T021)
- [x] T023 [US1] Register `ProjectsPage` as the root route (`/`) in the React Router route config
      in `frontend/src/App.tsx` (depends on T022, T009)
- [x] T024 [P] [US1] Component test: `CreateProjectForm` shows a specific validation message when
      submitted with a blank name, in `frontend/tests/unit/CreateProjectForm.test.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable/demoable.

---

## Phase 4: User Story 2 - Create and View Tasks Within a Project (Priority: P1)

**Goal**: A user can add tasks (with optional assignee and priority) to a project and see only
that project's tasks. Assigning requires a team member, so minimal team-member management is
included here (spec Edge Cases).

**Independent Test**: Open an existing project, create a task with a title (and optionally an
assignee/priority), and confirm it appears only in that project's task list.

### Tests for User Story 2

- [x] T025 [P] [US2] Contract test: `POST /api/team-members` — valid `name` returns 201; blank
      `name` returns 400, in `backend/tests/contract/teamMembers.post.test.ts`
- [x] T026 [P] [US2] Contract test: `GET /api/team-members` — returns all created team members, in
      `backend/tests/contract/teamMembers.get.test.ts`
- [x] T027 [P] [US2] Contract test: `POST /api/projects/:projectId/tasks` — valid `title` returns
      201 with `status: "Todo"`; omitted `priority` defaults to `"Medium"` (FR-010); blank `title`
      returns 400 (FR-005); unknown `projectId` returns 404, in
      `backend/tests/contract/tasks.post.test.ts`
- [x] T028 [P] [US2] Contract test: `GET /api/projects/:projectId/tasks` — returns only tasks
      belonging to that project, never another project's tasks (FR-006); unknown `projectId`
      returns 404, in `backend/tests/contract/tasks.get.test.ts`

### Implementation for User Story 2

- [x] T029 [P] [US2] Create `TeamMember` Mongoose model in `backend/src/models/TeamMember.ts` with
      `name: string` ("Required; trimmed; rejected if empty/whitespace-only") and `createdAt`, per
      data-model.md
- [x] T030 [P] [US2] Create `Task` Mongoose model in `backend/src/models/Task.ts` with `projectId`
      (ref Project, required), `title` ("Required; trimmed; rejected if empty/whitespace-only
      (FR-005)"), `description` (optional), `priority` (enum `"Low" | "Medium" | "High"`,
      "Defaults to \"Medium\" if omitted at creation (FR-010)"), `status` (enum `"Todo" | "In
      Progress" | "Done"`, "Defaults to \"Todo\" at creation (FR-011)"), `assigneeId` (ref
      TeamMember, optional/nullable, "a task may remain unassigned (FR-008)"), `createdAt`, per
      data-model.md
- [x] T031 [P] [US2] Create Zod schemas for team-member creation (`name`: `z.string().trim().min(1)`,
      rejecting whitespace-only the same as empty, per spec.md Edge Cases) and task creation
      (`title`: `z.string().trim().min(1)` with the same rule, `priority` optional enum,
      `assigneeId` optional string) in `backend/src/validation/teamMember.ts` and
      `backend/src/validation/task.ts`
- [x] T032 [US2] Implement `teamMemberService` with `createTeamMember` and `listTeamMembers` in
      `backend/src/services/teamMemberService.ts` (depends on T029)
- [x] T033 [US2] Implement `taskService` with `createTask` (validates `projectId` exists via
      `projectService`, and `assigneeId` exists via `teamMemberService` when provided) and
      `listTasksByProject` in `backend/src/services/taskService.ts` (depends on T030, T016, T032)
- [x] T034 [US2] Implement `GET /api/team-members` and `POST /api/team-members` in
      `backend/src/api/teamMembers.ts`, mounted under `/api` in `backend/src/app.ts` (depends on
      T031, T032)
- [x] T035 [US2] Implement `GET /api/projects/:projectId/tasks` and `POST
      /api/projects/:projectId/tasks` in `backend/src/api/tasks.ts`, mounted under `/api` in
      `backend/src/app.ts` (depends on T031, T033)
- [x] T036 [P] [US2] Create TanStack Query hooks `useTeamMembers` (list) and `useCreateTeamMember`
      (mutation, invalidating the team-members list) in `frontend/src/api/teamMembers.ts` (depends
      on T010, T011)
- [x] T037 [P] [US2] Create TanStack Query hooks `useProjectTasks(projectId)` (list) and
      `useCreateTask(projectId)` (mutation, invalidating that project's task list) in
      `frontend/src/api/tasks.ts` (depends on T010, T011)
- [x] T038 [P] [US2] Create reusable `TaskCard` component displaying title, priority, assignee
      name (or "Unassigned"), and status, in `frontend/src/components/TaskCard.tsx`
- [x] T039 [P] [US2] Create reusable `PriorityBadge` component for the three priority levels
      (`Low`/`Medium`/`High`) in `frontend/src/components/PriorityBadge.tsx`
- [x] T040 [P] [US2] Create `CreateTaskForm` component: labeled title input with inline validation
      message on blank submit, optional description, priority select defaulting to `Medium`, and
      an assignee select populated from team members with an inline "add team member" action, in
      `frontend/src/components/CreateTaskForm.tsx`
- [x] T041 [US2] Create `ProjectDetailPage` assembling the project's task list (`TaskCard` per
      task) and `CreateTaskForm`, wired to `useProjectTasks`/`useCreateTask`/`useTeamMembers`/
      `useCreateTeamMember`, in `frontend/src/pages/ProjectDetailPage.tsx` (depends on T036, T037,
      T038, T039, T040)
- [x] T042 [US2] Register the project detail route (`/projects/:projectId`) in React Router and
      link to it from `ProjectCard`, in `frontend/src/App.tsx` and `frontend/src/components/
      ProjectCard.tsx` (depends on T041, T023)
- [x] T043 [P] [US2] Component test: `CreateTaskForm` shows a specific validation message when
      submitted with a blank title, in `frontend/tests/unit/CreateTaskForm.test.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Move Tasks Through Workflow Stages (Priority: P2)

**Goal**: A user can move a task between Todo, In Progress, and Done, in any direction.

**Independent Test**: Take an existing task and move it through each of the three statuses,
confirming the displayed status updates each time, including moving "backward".

### Tests for User Story 3

- [x] T044 [P] [US3] Contract test: `PATCH /api/tasks/:taskId` — moving `status` through
      Todo→In Progress→Done→Todo updates correctly (FR-012); setting `status` to its current value
      is a no-op with no error; an invalid status value returns 400; an unknown `taskId` returns
      404; updating `priority` alone persists the new priority (FR-009); updating `assigneeId`
      alone persists the new assignee or clears it when `null` (FR-008 "afterward" case); an
      `assigneeId` that does not reference an existing team member returns 404, in
      `backend/tests/contract/tasks.patch.test.ts`

### Implementation for User Story 3

- [x] T045 [US3] Extend `taskService` with `updateTask` (partial update of `status`, `priority`,
      and/or `assigneeId`; `status` validated as one of the three enum values with same-value
      updates treated as a no-op; `assigneeId` validated against `teamMemberService` when provided
      and non-null, per FR-008/FR-009) in `backend/src/services/taskService.ts` (depends on T033,
      T032)
- [x] T046 [US3] Implement `PATCH /api/tasks/:taskId` in `backend/src/api/tasks.ts`, accepting any
      of `status`/`priority`/`assigneeId` (at least one required) per `contracts/api.md`,
      validating the body with a Zod schema before calling `taskService.updateTask` (depends on
      T045)
- [x] T047 [P] [US3] Create `StatusControl` component (control to move a task between the three
      statuses) in `frontend/src/components/StatusControl.tsx`
- [x] T048 [US3] Add a `useUpdateTaskStatus` mutation hook (implemented as the more general
      `useUpdateTask`, which also covers priority/assigneeId updates for symmetry with the
      backend PATCH contract) (`PATCH`, invalidating that project's
      task list) in `frontend/src/api/tasks.ts` (depends on T037)
- [x] T049 [US3] Wire `StatusControl` into `TaskCard` on `ProjectDetailPage`, calling
      `useUpdateTaskStatus` (depends on T047, T048, T038, T041)
- [x] T050 [P] [US3] Component test: moving `StatusControl` to the task's current status makes no
      change and shows no error, in `frontend/tests/unit/StatusControl.test.tsx`

**Checkpoint**: User Stories 1–3 all work independently.

---

## Phase 6: User Story 4 - Filter Tasks by Status and Priority (Priority: P2)

**Goal**: A user can narrow a project's task list by status, by priority, or by both.

**Independent Test**: With tasks in varied statuses/priorities, apply each filter combination and
confirm only matching tasks show, including a clear empty-state message when nothing matches.

### Tests for User Story 4

- [x] T051 [P] [US4] Contract test: `GET /api/projects/:projectId/tasks?status=...&priority=...` —
      filtering by status alone, priority alone, and both together each return only matching
      tasks; a combination matching nothing returns an empty array (FR-013, FR-014), in
      `backend/tests/contract/tasks.filter.test.ts`

### Implementation for User Story 4

- [x] T052 [US4] Extend `taskService.listTasksByProject` to accept optional `status` and
      `priority` filters in `backend/src/services/taskService.ts` (depends on T033)
- [x] T053 [US4] Extend the `GET /api/projects/:projectId/tasks` handler to parse and validate
      `status`/`priority` query params and pass them through, in `backend/src/api/tasks.ts`
      (depends on T052)
- [x] T054 [P] [US4] Create `FilterBar` component (status select, priority select, clear action)
      in `frontend/src/components/FilterBar.tsx`
- [x] T055 [US4] Extend `useProjectTasks` to accept filter params and include them in the query
      key and request, in `frontend/src/api/tasks.ts` (depends on T037)
- [x] T056 [US4] Wire `FilterBar` into `ProjectDetailPage`, showing a clear empty-state message
      when the filtered list is empty (FR-014), in `frontend/src/pages/ProjectDetailPage.tsx`
      (depends on T054, T055, T041)
- [x] T057 [P] [US4] Component test: `FilterBar` (scoped to FilterBar's own filter-state
      behavior; the empty-result message it triggers is rendered by `ProjectDetailPage`, exercised
      manually via the quickstart walkthrough, T068) combined with an empty result renders the
      empty-state message rather than a blank list, in `frontend/tests/unit/FilterBar.test.tsx`

**Checkpoint**: User Stories 1–4 all work independently.

---

## Phase 7: User Story 5 - View Basic Project Progress (Priority: P3)

**Goal**: A user can see a project's completion progress without opening individual tasks.

**Independent Test**: With a known mix of task statuses, confirm the displayed progress matches
the expected proportion of "Done" tasks, including a "no tasks yet" state for an empty project.

### Tests for User Story 5

- [x] T058 [P] [US5] Contract test: `GET /api/projects/:projectId/progress` — returns the correct
      `totalTasks`/`doneTasks`/`progress` ratio (FR-015); returns `progress: null` with
      `totalTasks: 0` for a project with no tasks rather than a numeric result (FR-016); unknown
      `projectId` returns 404, in `backend/tests/contract/projects.progress.test.ts`

### Implementation for User Story 5

- [x] T059 [US5] Implement `getProjectProgress` (total task count, done task count, `progress =
      doneTasks / totalTasks` or `null` when `totalTasks === 0`) in
      `backend/src/services/projectService.ts` (depends on T016, T033)
- [x] T060 [US5] Implement `GET /api/projects/:projectId/progress` in
      `backend/src/api/projects.ts` (depends on T059)
- [x] T061 [P] [US5] Create `ProgressSummary` component (ratio/percentage display, explicit
      "no tasks yet" state) in `frontend/src/components/ProgressSummary.tsx`
- [x] T062 [US5] Add a `useProjectProgress` query hook in `frontend/src/api/projects.ts` (depends
      on T010, T011)
- [x] T063 [US5] Wire `ProgressSummary` into `ProjectDetailPage` using `useProjectProgress`
      (depends on T061, T062, T041)
- [x] T064 [P] [US5] Component test: `ProgressSummary` renders the zero-task, partial, and
      fully-complete states correctly, in `frontend/tests/unit/ProgressSummary.test.tsx`

**Checkpoint**: All five user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Repository-level documentation and validation that spans all stories.

- [x] T065 [P] Write root `README.md` documenting the monorepo layout and how to run both
      workspaces locally, based on `quickstart.md`
- [x] T066 [P] Add unit tests for `taskService` covering default status/priority assignment and
      same-status-update no-op behavior, independent of HTTP, in
      `backend/tests/unit/taskService.test.ts` (depends on T033, T045)
- [x] T067 [P] Add unit tests for `projectService.getProjectProgress` covering zero-task, partial,
      and fully-complete cases, in `backend/tests/unit/projectService.test.ts` (depends on T059)
- [ ] T068 Run the `quickstart.md` manual validation walkthrough end-to-end against the running
      app and fix any discrepancies found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phase 3–7)**: All depend on Foundational phase completion.
  - US1 has no dependency on other stories.
  - US2 depends on US1's `projectService` (T016) to validate `projectId` when creating a task, but
    is otherwise independently testable once US1 exists.
  - US3 and US4 both depend on US2's `taskService`/`Task` model (T030, T033) existing.
  - US5 depends on US1's `projectService` and US2's `taskService` (read-only aggregation over
    both).
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- All Setup tasks marked `[P]` (T002–T006) can run in parallel after T001.
- Foundational tasks T009, T010, T011 (frontend) can run in parallel with T007, T008 (backend).
- Within each user story, model/schema/hook/component creation tasks marked `[P]` can run in
  parallel; sequential tasks (services, routers, pages) depend on those finishing first.
- US3 and US4 (Phases 5 and 6) both depend only on US2, not on each other — they can be built in
  parallel by different developers once Phase 4 is complete.

---

## Parallel Example: User Story 1

```bash
# Contract tests together:
Task: "Contract test for POST /api/projects in backend/tests/contract/projects.post.test.ts"
Task: "Contract test for GET /api/projects in backend/tests/contract/projects.get.test.ts"

# Model + schema together:
Task: "Create Project model in backend/src/models/Project.ts"
Task: "Create Zod schema for project creation in backend/src/validation/project.ts"

# Frontend pieces together:
Task: "Create useProjects/useCreateProject hooks in frontend/src/api/projects.ts"
Task: "Create ProjectCard component in frontend/src/components/ProjectCard.tsx"
Task: "Create CreateProjectForm component in frontend/src/components/CreateProjectForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: create a project, confirm it lists, confirm blank-name validation.
5. Demo if ready.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add US1 → test independently → demo (MVP).
3. Add US2 → test independently → demo (projects now hold tasks, with assignment).
4. Add US3 → test independently → demo (tasks move through workflow).
5. Add US4 → test independently → demo (task list is filterable).
6. Add US5 → test independently → demo (project progress visible).
7. Phase 8 polish.

---

## Notes

- `[P]` tasks touch different files with no unmet dependencies.
- `[Story]` labels map every user-story-phase task back to spec.md for traceability.
- Backend tests are required by Constitution Principle VI, not optional; write them before or
  alongside the implementation task they validate, and ensure they pass before moving on.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently before moving to the next.
- The team-member assignment model used in US2 (dedicated `TeamMember` list, per research.md item
  7) was a recommended default that the user had not yet confirmed as of `/speckit-plan`. If it
  is later changed to free-text assignment, T025, T026, T029, T031 (team-member half), T032, T034,
  and the assignee-related parts of T036, T040 would need to be revised accordingly.
