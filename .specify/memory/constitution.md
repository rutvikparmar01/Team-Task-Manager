<!--
Sync Impact Report
Version change: 1.0.0 → 2.0.0
Rationale for MAJOR bump: The full principle set is replaced with a new, differently-scoped
set of 10 principles supplied directly by the project owner. This is a backward-incompatible
redefinition, not an addition — prior principles no longer stand as written.
Modified principles:
  - I. Test-First Development → VI. Automated Backend Testing (narrowed to backend; no longer
    mandates red-green-refactor ordering for all changes)
  - II. Simplicity & Maintainability → IX. Demonstration-Scale Simplicity (re-scoped to an
    explicit demo-sized ceiling)
  - III. UX Consistency → VII. Reusable, Accessible Frontend Components (re-scoped to
    component reusability + accessibility rather than cross-screen interaction consistency)
Added principles: I. TypeScript Everywhere, II. Specification as Source of Truth,
  III. Acceptance Criteria for Every Requirement, IV. Input Validation at the API Boundary,
  V. Business Logic Independent of HTTP Layer, VIII. No Unspecified Functionality,
  X. Free and Open-Source Tooling Preference
Added sections: Technology Stack
Removed sections: Quality Gates (superseded by Development Workflow, which now folds in the
  review-gate language)
Follow-up TODOs: none
-->

# Task Management Application Constitution

## Core Principles

### I. TypeScript Everywhere
All application code — frontend (React) and backend (Node.js) — MUST be written in
TypeScript with strict type-checking enabled. Plain JavaScript files MUST NOT be added to
either the frontend or backend source trees except for standard tooling config files that
do not support TypeScript.

Rationale: A single language and type system across the stack reduces context-switching
and catches boundary mismatches (e.g. request/response shapes) at compile time.

### II. Specification as Source of Truth
The written specification (spec.md and its accepted clarifications) is authoritative over
verbal discussion, code comments, or prior implementation. When code and specification
disagree, the specification MUST be updated first (or the discrepancy resolved with the
spec owner) before the code is changed to something not already described in it.

Rationale: Without a single authoritative source, implementation drifts from intent and
"the code is the spec" becomes an excuse to skip re-validating requirements.

### III. Acceptance Criteria for Every Requirement
Every functional requirement in the specification MUST have explicit, testable acceptance
criteria before it is implemented. A requirement without acceptance criteria MUST be
clarified (via /speckit-clarify or equivalent) before /speckit-tasks or implementation
proceeds on it.

Rationale: Acceptance criteria are what make "done" checkable; a requirement without them
cannot be verified as satisfied or rejected.

### IV. Input Validation at the API Boundary
Every API endpoint MUST validate all incoming input (body, params, query) against an
explicit schema before that input reaches business logic. Invalid input MUST be rejected
with a clear error response and MUST NOT be passed through to the database layer or
downstream services.

Rationale: Validating at the boundary keeps malformed or malicious input from propagating
into business logic or persistence, and gives one place to reason about trust.

### V. Business Logic Independent of HTTP Layer
Business logic (domain rules, validations beyond basic input shape, orchestration) MUST
live in modules that do not import HTTP framework types (e.g. Express `Request`/`Response`)
and MUST be callable and testable without an HTTP server running. Controllers/route
handlers MUST be thin: parse/validate input, call business logic, map the result to an
HTTP response.

Rationale: Decoupling business logic from the transport layer keeps it testable in
isolation and reusable if the transport (REST, CLI, jobs) changes.

### VI. Automated Backend Testing
All backend functionality (business logic modules and API endpoints) MUST have automated
tests covering its expected behavior, including at least one failure/invalid-input case per
endpoint. A backend change MUST NOT be merged without a passing test that exercises it.

Rationale: The backend owns validation, business rules, and persistence; automated tests
are the practical way to keep those correct as the codebase changes.

### VII. Reusable, Accessible Frontend Components
Frontend components MUST be built for reuse (props-driven, no hidden dependence on a
specific page's global state) and MUST meet baseline accessibility practice: semantic HTML
elements, labeled form inputs, visible focus states, and sufficient color contrast. A new
component MUST NOT duplicate an existing component's behavior; the existing one is
extended or reused instead.

Rationale: A task manager is used continuously by real people; inaccessible or
one-off, non-reusable components compound into inconsistent UX and duplicated bugs.

### VIII. No Unspecified Functionality
Functionality not described by the specification MUST NOT be implemented, even if it seems
useful, small, or "obviously" needed. If a gap is found during implementation, it MUST be
raised as a specification change (via clarification or an updated spec) before being built.

Rationale: Unspecified functionality is unreviewed, untested against acceptance criteria by
definition, and is the most common source of scope creep in a fixed-scope demo project.

### IX. Demonstration-Scale Simplicity
The application MUST be kept simple enough to build, run, and explain in a demonstration
setting: minimal moving parts, no infrastructure (queues, caches, microservices) beyond
what the specification explicitly requires, and setup achievable with a short, documented
sequence of commands. Do not add scaling, multi-tenancy, or production-hardening concerns
that the specification does not call for.

Rationale: This is a demonstration project; complexity that serves hypothetical production
scale costs setup time and explanatory clarity without a corresponding demonstrated need.

### X. Free and Open-Source Tooling Preference
Libraries, frameworks, and services used MUST be free and open-source unless the
specification explicitly calls for a specific paid or proprietary tool. When multiple
options satisfy a need, the free/open-source option MUST be chosen over a paid or
closed-source alternative.

Rationale: Keeps the project runnable and reproducible by anyone without introducing
licensing cost or vendor lock-in for a demonstration application.

## Technology Stack

- Frontend: React with TypeScript.
- Backend: Node.js with TypeScript.
- Persistence: MongoDB.

Any change to this stack (adding a second datastore, replacing a framework, introducing a
new runtime) is a constitution amendment, not a routine implementation decision, and MUST
go through the amendment process below.

## Development Workflow

Feature work follows the specify → plan → tasks → implement flow. Before implementation
tasks are generated, every functional requirement in the spec MUST already carry acceptance
criteria (Principle III); tasks MUST NOT be generated for requirements that still lack
them. A pull request MUST be rejected in review if it: introduces functionality absent from
the spec (Principle VIII), adds backend logic without a corresponding test (Principle VI),
couples business logic to controller/route code (Principle V), or skips input validation on
a new or changed endpoint (Principle IV).

## Governance

This constitution supersedes any conflicting team practice or prior informal convention.
Amendments require: (1) a documented rationale for the change, (2) a version bump per the
policy below, and (3) an update to any dependent template or workflow doc that the Sync
Impact Report identifies as affected. All pull requests and code reviews MUST verify
compliance with the principles above; any exception MUST be justified in writing in the
PR/plan and is reviewed at the next amendment cycle rather than left unaddressed.

Versioning policy (semantic versioning for this document):
- MAJOR: A principle is removed or redefined in a way that is backward-incompatible with
  prior approved work.
- MINOR: A new principle or materially expanded section is added.
- PATCH: Wording clarifications, typo fixes, or non-semantic refinements.

**Version**: 2.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
