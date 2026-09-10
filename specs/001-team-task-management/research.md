# Phase 0 Research: Team Task Management

## 1. Backend web framework

**Decision**: Express.js (with `@types/express`)

**Rationale**: Mature, minimal-ceremony, huge ecosystem and documentation base, which suits a
demonstration project meant to be read and explained (Constitution Principle IX). Pairs cleanly
with a thin controller layer that just parses/validates input and calls services (Principle V).

**Alternatives considered**: Fastify (comparable simplicity, slightly better raw performance —
rejected only because Express's ubiquity better serves a teaching/demo context, not because of any
functional gap). NestJS (rejected — its DI container, decorators, and module system are ceremony
this app's scope doesn't need and would work against Principle IX).

## 2. Input validation

**Decision**: Zod

**Rationale**: TypeScript-first schema validation that infers static types directly from the
schema, so the validation rule and the TypeScript type are defined once. This directly satisfies
Principle IV (validate at the API boundary) and Principle I (TypeScript everywhere) with a single
artifact instead of two things that can drift apart.

**Alternatives considered**: Joi (mature, but no static type inference — types would need to be
kept in sync by hand). class-validator (requires decorator-based classes, more ceremony for the
same outcome).

## 3. Persistence / MongoDB access

**Decision**: Mongoose

**Rationale**: Schema-defined models give a typed, validated second line of defense at the
persistence layer and map directly onto `data-model.md`. Mongoose models live entirely inside
`backend/src/models/` and are only ever called from `backend/src/services/`, keeping business
logic decoupled from HTTP (Principle V). Free and open-source (Principle X).

**Alternatives considered**: Native MongoDB Node.js driver (more boilerplate to get the same
schema/typing benefits). Prisma (its MongoDB support adds a generated-client build step that is
unnecessary weight for this scope).

## 4. Frontend build tooling

**Decision**: Vite + React + TypeScript

**Rationale**: Fast dev server, minimal configuration, first-class TypeScript support, and a
single command to run — consistent with demonstration-scale simplicity (Principle IX). Free and
open-source (Principle X).

**Alternatives considered**: Create React App (effectively unmaintained). Next.js (adds
server-rendering/routing conventions and a server runtime that this app doesn't need, since the
frontend is a plain SPA calling a separate API).

## 5. Frontend state / data fetching

**Decision (updated per explicit user direction)**: TanStack Query for all server-state
(projects, tasks, team members — fetching, caching, and mutations), backed by a small typed
`fetch` client in `frontend/src/api/`. React Router handles navigation between the projects list
and a project's detail view. No separate global client-state library (e.g., Redux) — local UI
state (open filter values, form inputs) stays in component state.

**Rationale**: The user specified TanStack Query and React Router directly. TanStack Query
removes hand-written loading/error/caching logic for the several data views this app needs
(projects list, per-project task list with filters, progress), and its cache invalidation model
fits the mutate-then-refetch pattern used when creating a task or moving it between statuses.

**Alternatives considered (superseded)**: Plain `useState`/`useContext` with a manual fetch
wrapper — the original Phase 0 default before the user requested TanStack Query explicitly; no
longer used. Redux Toolkit — still unnecessary, since TanStack Query's cache covers the
server-state needs and there is little separate client-only state.

## 5a. Styling

**Decision**: Tailwind CSS (utility classes), configured via `frontend/src/styles/` and a
`tailwind.config` at the frontend workspace root.

**Rationale**: Directly requested by the user. Utility-class styling keeps components
self-contained (no separate stylesheet per component to keep in sync) and is free/open-source
(Principle X), consistent with building small, reusable, accessible components (Principle VII) —
Tailwind's utilities don't preclude semantic HTML, labels, or visible focus states, which are
applied explicitly regardless of styling approach.

**Alternatives considered**: CSS Modules / plain CSS (also valid, but not what the user asked
for). A component-library like MUI/Chakra (rejected — pulls in a full pre-built component set,
more than a demo-scoped app needs, and the user asked for Tailwind specifically).

## 6. Testing frameworks

**Decision**: Vitest for both packages. Backend adds Supertest for HTTP contract/integration
tests; frontend adds React Testing Library (with the `jsdom` environment) for component tests.

**Rationale**: Vitest is TypeScript-native with fast startup and a shared config style across
`backend/` and `frontend/`, directly supporting Principle VI (automated backend testing) and
Principle VII (reusable, accessible frontend components need behavior-level tests, not just
snapshots).

**Alternatives considered**: Jest (works, but slower/more config to get equivalent TypeScript
support via `ts-jest`). Mocha/Chai (more assembly required for equivalent coverage, no built-in
assertion/mocking parity with Vitest).

## 7. Team member assignment model (default pending confirmation)

**Decision (default)**: A dedicated `TeamMember` collection with a minimal create + list
capability. Assigning a task means selecting an existing team member (by id) rather than typing a
free-text name.

**Rationale**: This was raised as an open clarification question (`/speckit-clarify`) and was not
yet answered by the user at the time planning was requested. The plan proceeds with the
previously-stated recommended option because it matches the "Team Member" key entity already
defined in `spec.md`, and it lets assignment be validated against a real record at the API
boundary (Principle IV) instead of accepting arbitrary strings.

**Status**: **Not yet confirmed by the user.** If the user instead wants free-text assignment (no
dedicated list), `data-model.md`, `contracts/api.md`, and the corresponding tasks in `tasks.md`
will need a small, contained update (drop the `TeamMember` collection/endpoints, change `Task
.assigneeId` to `Task.assigneeName: string`). Flagging here rather than blocking planning on it.

**Alternatives considered**: Free-text assignee field (Option B from the clarify question) —
simpler, but allows typos/duplicate identities for the same person and has no validation target.

## 8. Project structure / monorepo tooling

**Decision (updated per explicit user direction)**: A single repository containing two npm
workspaces, `backend/` and `frontend/`, declared in a root `package.json` (`"workspaces":
["backend", "frontend"]`), communicating over a REST API. No dedicated monorepo build tool (Nx,
Turborepo, Lerna) is introduced.

**Rationale**: The user explicitly asked for "a monorepo structure with separate frontend and
backend applications" that stays "runnable locally without paid services." npm workspaces ships
with npm itself (free, no extra install, no account/service), gives a single root `npm install`
that hoists shared dependencies, and still keeps `backend/` and `frontend/` as independently
runnable, independently testable applications — matching the business-logic-independent-of-HTTP
(V) and TypeScript-everywhere (I) principles via separate `tsconfig.json`s per workspace.

**Alternatives considered**: Nx or Turborepo (both free/OSS, but add a build-graph/caching layer
and CLI that this demo-scoped app doesn't need — rejected under Principle IX). A single combined
package, e.g. Next.js full-stack (rejected in Phase 0 item 4 above for adding unneeded
server-rendering machinery, and it doesn't match "separate frontend and backend applications").
