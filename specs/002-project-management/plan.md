# Implementation Plan: Project Management

**Branch**: `002-project-management` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-project-management/spec.md`

## Summary

This feature tightens the rules around the `Project` entity that `001-team-task-management`
already shipped: project names must now be 3-100 characters and unique (case-insensitively,
after trimming), and creation must be rejected with a specific message when either rule is
violated. This is **not a new subsystem** — it is a targeted change to the existing `Project`
model, its Zod validation schema, and its service, plus the corresponding tests. `001`'s spec
was already amended to note this supersession (see `specs/001-team-task-management/spec.md`
Edge Cases). No new endpoints, entities, or frontend routes are introduced.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (backend); TypeScript 5.x with React 18
(frontend) — unchanged from `001`, reusing the existing monorepo.

**Primary Dependencies**: Unchanged (Express, Mongoose, Zod on the backend; React, Vite, React
Router, TanStack Query, Tailwind CSS on the frontend). No new dependencies are required — length
validation is native to Zod (`.min()`/`.max()`) and case-insensitive uniqueness is native to
MongoDB (collation-aware unique index).

**Storage**: MongoDB — this feature adds a case-insensitive unique index to the existing
`projects` collection. **This is the one place this feature touches already-live data**: see
Constraints below.

**Testing**: Unchanged — Vitest + Supertest against the existing in-memory MongoDB test harness
(`backend/tests/setup.ts`); new cases are added to the existing `backend/tests/contract/
projects.post.test.ts` rather than a new file, keeping one contract-test file per endpoint.

**Target Platform**: Unchanged (browser SPA + Node.js API), now formalized in the constitution
(v2.1.0) as deployed via Vercel — frontend static build, backend as Serverless Functions. That
deployment work itself (serverless adapter, connection caching) is tracked separately as its own
audit follow-up item and is **not** part of this feature's scope; this feature only needs to not
regress whatever deployment shape lands.

**Project Type**: Web application monorepo (existing `backend/` + `frontend/` npm workspaces) —
no structural change.

**Performance Goals**: Unchanged — demonstration scale, not production scale.

**Constraints**:
- **Existing data**: Earlier manual/demo testing (before this feature existed) created projects
  with duplicate names (e.g. two projects both named "Demo Project") under `001`'s original
  "duplicates allowed" rule. Adding a unique index will fail to build, or the uniqueness check
  will never trigger correctly, if duplicate names already exist in the target database when this
  ships. This must be handled explicitly during implementation (see `research.md` and
  `quickstart.md`), not discovered at deploy time.
- **Frontend error display dependency**: This spec's SC-002 ("100% of rejected attempts show a
  message identifying the reason") requires the frontend to actually render a server-rejected
  mutation's error message. As of this plan, the frontend has **no general mechanism to display
  any mutation error** (a gap identified in the project audit, tracked separately as its own P0
  item). This feature's tasks must include the minimal wiring needed for `CreateProjectForm`
  specifically to satisfy its own acceptance criteria, independent of whether the broader
  audit-driven fix has landed yet.

**Scale/Scope**: Same small demo scale as `001` — a handful of projects.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. TypeScript Everywhere | All changes are in existing TypeScript files; no new language surface | PASS |
| II. Specification as Source of Truth | `001`'s conflicting Edge Case was amended before this plan was written, per Principle II's own requirement to resolve spec/spec conflicts before proceeding | PASS |
| III. Acceptance Criteria for Every Requirement | Every FR-001..FR-008 in spec.md has acceptance scenarios attached | PASS |
| IV. Input Validation at the API Boundary | Length + uniqueness both validated before reaching the database (Zod for length; a pre-check plus a DB-level index for uniqueness — see research.md) | PASS (planned) |
| V. Business Logic Independent of HTTP Layer | Uniqueness/length checks live in `projectService`, not in `api/projects.ts` | PASS (planned) |
| VI. Automated Backend Testing | New contract test cases for both boundary lengths and three duplicate variants (exact/case/whitespace), plus a failure case | PASS (planned) |
| VII. Reusable, Accessible Frontend Components | Reuses the existing `CreateProjectForm`; only its error-rendering path is extended, no new component | PASS (planned) |
| VIII. No Unspecified Functionality | Scope limited exactly to spec.md's 8 FRs; no additional Project fields or operations added | PASS |
| IX. Demonstration-Scale Simplicity | No new infrastructure; reuses the existing MongoDB instance and index support already built into it | PASS |
| X. Free and Open-Source Tooling Preference | No new tooling introduced. (Noting for completeness: the constitution's own Technology Stack section now names Vercel, a proprietary platform, as the deployment target — this is an explicit, documented stack decision made through the amendment process itself, which is the exception Principle X allows for; not a routine implementation choice made in this plan.) | PASS |

No violations identified; Complexity Tracking table is not needed.

*Re-checked after Phase 1 design: unchanged — the data-model and contract deltas below stay
within the same stack and scope, so all rows above still hold.*

## Project Structure

### Documentation (this feature)

```text
specs/002-project-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output — delta to the Project entity only
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output — delta to the Project endpoints only
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

No new top-level structure — this feature **modifies existing files** from `001`:

```text
backend/
├── src/
│   ├── models/Project.ts        # MODIFY: add minlength/maxlength, case-insensitive unique index
│   ├── validation/project.ts    # MODIFY: add .min(3)/.max(100) to the name schema
│   └── services/projectService.ts   # MODIFY: add duplicate-name check → ValidationError (400)
└── tests/
    └── contract/projects.post.test.ts   # MODIFY: add boundary-length and duplicate-name cases

frontend/
├── src/
│   ├── components/CreateProjectForm.tsx   # MODIFY: render a server-rejected error message
│   └── api/projects.ts                     # MODIFY: surface the create-project mutation's error
└── tests/
    └── unit/CreateProjectForm.test.tsx     # MODIFY: add a rejected-mutation test case
```

**Structure Decision**: No new packages, routes, or entities. This feature is scoped as a set of
targeted modifications to `001`'s existing `Project` vertical slice, consistent with it being a
refinement of already-shipped functionality rather than new functionality.

## Complexity Tracking

> Not applicable — no Constitution Check violations were identified above.
