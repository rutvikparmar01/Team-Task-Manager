# Phase 0 Research: Project Management

## 1. Name length validation (3-100 characters)

**Decision**: Add `.trim().min(3, "...").max(100, "...")` to the existing Zod schema in
`backend/src/validation/project.ts`, and matching `minlength`/`maxlength` on the Mongoose schema
in `backend/src/models/Project.ts` as a second line of defense.

**Rationale**: Zod already validates at the API boundary (Constitution Principle IV); extending
the existing `name` rule with length bounds is the minimal change. The Mongoose-level constraint
is a defense-in-depth backstop consistent with how `001`'s models already pair Zod + Mongoose
rules (e.g. `required`/`trim` on every string field).

**Alternatives considered**: Enforcing length only at the Mongoose layer — rejected, since a
request that fails only at the DB layer produces a less controlled error shape than a Zod
rejection handled explicitly in the route (Zod errors already map cleanly to 400 via the existing
error middleware).

## 2. Case-insensitive, trimmed uniqueness

**Decision**: Two layers, not one:
1. A MongoDB **collation-aware unique index** on `Project.name` (`{ name: 1 }` with index options
   `{ unique: true, collation: { locale: "en", strength: 2 } }`), which makes "Marketing Site" and
   "marketing site" collide at the database level. Strength 2 collation compares case- and
   accent-insensitively; trimming already happens before storage (existing `trim: true` behavior),
   so whitespace differences are already normalized away before the index ever sees the value.
2. An **application-level pre-check** in `projectService.createProject` (case-insensitive query
   for an existing project with the same trimmed name) that returns a clean `ValidationError`
   (400, `"A project named ... already exists."`) *before* attempting the insert.

**Rationale**: The pre-check gives a clean, predictable 400 for the common case (Constitution
Principle IV — validate before reaching persistence). The unique index is the actual correctness
guarantee under concurrent requests — two near-simultaneous creations of the same name could both
pass the pre-check before either insert completes; the index guarantees only one write succeeds.
The service must therefore *also* catch a MongoDB duplicate-key error (code `11000`) on insert and
map it to the same 400 `ValidationError`, in case the pre-check is bypassed by a race.

**Alternatives considered**: A pre-check alone, no index — rejected as race-condition-prone
(exactly what Constitution Principle IV's "validate before reaching persistence" is meant to
backstop, not replace). A separate normalized `nameLower` shadow field with a plain unique
index — rejected as redundant data; MongoDB's native collation support achieves the same
guarantee without a duplicated, must-stay-in-sync field.

## 3. Existing duplicate-named data

**Decision**: Before the unique index is created against a database that already has demo data,
the target database must be checked for any existing case-insensitive duplicate names, and any
found must be resolved (renamed or deleted) as a one-time manual step. `createIndex` with
`unique: true` fails outright if the collection already contains a collision at deploy time, so
this is a hard prerequisite, not a nice-to-have. (Verified 2026-09-10 as part of implementation:
the currently active Atlas database contains exactly one project, "Demo" — no duplicate exists
today. An earlier duplicate, "Demo Project" created twice, existed only in a local MongoDB
instance that is no longer in use. The check itself remains a required step for any future
deploy target, since it depends on whatever data exists in that database at that time.)

**Rationale**: This is existing data created before this feature existed; it is an operational
migration concern, not a functional requirement of the feature itself (Constitution Principle
VIII — don't build unspecified functionality, e.g. an automatic dedup-on-deploy script, when a
one-time manual cleanup is sufficient for a demo-scale database).

**Alternatives considered**: An automatic migration script that renames/merges duplicates on
startup — rejected as disproportionate machinery for a demo-scale, one-time cleanup (Constitution
Principle IX).

## 4. Frontend error display for this feature specifically

**Decision**: Wire `CreateProjectForm`'s existing `role="alert"` element to also display the
`useCreateProject` mutation's rejection message (length/duplicate errors from the backend), not
just the pre-existing client-side blank-name check.

**Rationale**: This spec's SC-002 requires every rejected attempt (missing, too short, too long,
duplicate) to show a message identifying the reason. Only the "missing" case has any client-side
pre-check today; too-short, too-long, and duplicate can only be detected by the backend, so the
frontend needs a path to show whatever message the server returns. This is scoped narrowly to
`CreateProjectForm`/`useCreateProject` for this feature; the broader gap (no error handling
anywhere else in the app) is tracked separately as its own audit follow-up item and is not
duplicated here.

**Alternatives considered**: Deferring this entirely to the broader audit fix — rejected because
it would leave this feature's own acceptance criteria (SC-002) unmet on delivery.
