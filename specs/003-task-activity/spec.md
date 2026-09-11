# Feature Specification: Task Activity History

**Feature Branch**: `003-task-activity`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Add an activity history feature to the Team Task Manager. The
system must record important actions performed on tasks (creation, assignment, status changes,
priority changes) and display the activity history on the task details page, giving users a
chronological record of what happened to a task."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View a Task's Activity History (Priority: P1)

A user opens a task and sees a chronological record of what has happened to it, newest first,
including an empty state when nothing has happened yet.

**Why this priority**: This is the user-facing value of the whole feature; it can be
demonstrated on its own (even showing only the empty state) before any recording behavior exists.

**Independent Test**: Can be fully tested by opening a task with no recorded activity and
confirming a clear empty state is shown, independent of any of the recording stories below.

**Acceptance Scenarios**:

1. **Given** a task has one or more recorded activities, **When** a user opens that task, **Then**
   they see an Activity section listing each activity, ordered newest first.
2. **Given** an activity is displayed, **When** a user reads it, **Then** it reads as a
   plain-language description (e.g., "Status changed from Todo to In Progress"), not an internal
   code or category name.
3. **Given** a task has no recorded activity yet, **When** a user opens that task, **Then** the
   Activity section shows a clear "no activity yet" message instead of an empty or broken-looking
   section.
4. **Given** the activity history fails to load (e.g., a network or server error), **When** the
   user views the task, **Then** a clear error message is shown in place of the Activity section's
   content.

---

### User Story 2 - Record Activity on Task Creation (Priority: P1)

When a task is created, that creation is itself recorded as the task's first activity entry.

**Why this priority**: Pairs with User Story 1 to form a minimal demonstrable slice: create a
task, then see one activity entry for it.

**Independent Test**: Can be fully tested by creating a task and confirming exactly one activity
entry appears for it, describing that it was created.

**Acceptance Scenarios**:

1. **Given** a new task is created, **When** its activity history is viewed, **Then** it contains
   exactly one activity describing the task's creation, timestamped at creation time.

---

### User Story 3 - Record Activity on Status Change (Priority: P2)

When a task's status changes, that change is recorded as an activity showing the previous and
new status.

**Why this priority**: Extends the activity history to the most frequently changing field, but
depends on task creation (User Story 2) already producing a history to append to.

**Independent Test**: Can be fully tested by moving a task's status and confirming a new activity
appears describing the previous and new status.

**Acceptance Scenarios**:

1. **Given** a task with status "Todo", **When** its status is changed to "In Progress", **Then**
   a new activity appears describing the change from "Todo" to "In Progress".
2. **Given** a task's status is set to the value it already has, **When** that update is
   submitted, **Then** no new activity is recorded (consistent with this being a no-op, per the
   existing task status behavior).

---

### User Story 4 - Record Activity on Priority Change (Priority: P2)

When a task's priority changes, that change is recorded as an activity showing the previous and
new priority.

**Why this priority**: Same rationale as User Story 3 — extends coverage to another frequently
changing field.

**Independent Test**: Can be fully tested by changing a task's priority and confirming a new
activity appears describing the previous and new priority.

**Acceptance Scenarios**:

1. **Given** a task with priority "Medium", **When** its priority is changed to "High", **Then**
   a new activity appears describing the change from "Medium" to "High".
2. **Given** a task's priority is set to the value it already has, **When** that update is
   submitted, **Then** no new activity is recorded.

---

### User Story 5 - Record Activity on Assignment Change (Priority: P2)

When a task's assignee changes — including being assigned for the first time, reassigned to a
different team member, or unassigned — that change is recorded as an activity.

**Why this priority**: Completes coverage of the fields tracked elsewhere in the app; depends on
task creation (User Story 2) already producing a history to append to.

**Independent Test**: Can be fully tested by assigning, reassigning, and unassigning a task and
confirming a new activity appears each time, naming the team member involved (or "Unassigned").

**Acceptance Scenarios**:

1. **Given** an unassigned task, **When** it is assigned to a team member, **Then** a new
   activity appears naming that team member.
2. **Given** a task assigned to one team member, **When** it is reassigned to a different team
   member, **Then** a new activity appears naming the newly assigned team member.
3. **Given** an assigned task, **When** it is unassigned, **Then** a new activity appears
   indicating it is now unassigned.

---

### Edge Cases

- What happens when a task's status is set to the value it already has? No activity is recorded
  (User Story 3, Acceptance Scenario 2).
- What happens when a task's priority is set to the value it already has? No activity is recorded
  (User Story 4, Acceptance Scenario 2).
- What happens when an activity history is requested for a task ID that does not exist? The
  system MUST respond with a clear "task not found" error rather than an empty history.
- What happens when the activity history fails to load? The system MUST show a clear error state
  rather than an empty or broken-looking section (User Story 1, Acceptance Scenario 4).
- What happens when a task accumulates many activities over time? All of them are recorded and
  shown, newest first; this feature does not define a retention limit or pagination scheme.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record an activity when a task is created, capturing the creation
  timestamp.
- **FR-002**: The system MUST record an activity whenever a task's assignee changes (first
  assignment, reassignment, or unassignment), capturing the team member involved, or that the
  task became unassigned.
- **FR-003**: The system MUST record an activity whenever a task's status changes, capturing the
  previous and new status, and MUST NOT record an activity when a status update does not change
  the value.
- **FR-004**: The system MUST record an activity whenever a task's priority changes, capturing
  the previous and new priority, and MUST NOT record an activity when a priority update does not
  change the value.
- **FR-005**: The system MUST display a task's activity history on that task's detail view,
  ordered from newest to oldest.
- **FR-006**: Each displayed activity MUST show a human-readable, plain-language description of
  what happened, not an internal type code or category name.
- **FR-007**: Each displayed activity MUST show when it occurred.
- **FR-008**: The system MUST display a clear empty-state message when a task has no recorded
  activity yet.
- **FR-009**: The system MUST display a clear error message if a task's activity history fails to
  load.
- **FR-010**: The system MUST respond with a clear "not found" error when activity history is
  requested for a task that does not exist.
- **FR-011**: The system MUST NOT provide any way to modify or delete an existing activity record
  through the application — activity records are append-only history.

### Key Entities

- **Activity**: A single historical record of something that happened to a task. Attributes:
  which task it belongs to, its category (task created / assignee changed / status changed /
  priority changed), the details specific to that category (e.g., previous and new status), the
  team member involved when the category naturally has one (currently only assignee changes —
  see Assumptions), and when it occurred. Activities are never edited or deleted once created.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can determine everything that has happened to a task — when it was created,
  and every status, priority, and assignment change since — without asking a teammate, 100% of
  the time.
- **SC-002**: Every task creation, and every status, priority, or assignment change that actually
  changes the value, produces exactly one corresponding activity record.
- **SC-003**: 0% of status or priority updates that leave the value unchanged produce an activity
  record.
- **SC-004**: A user reading any activity entry understands what happened from its wording alone,
  without needing to know any internal type codes, 100% of the time.
- **SC-005**: A task with no history yet shows a clear "no activity" indicator, never a blank or
  broken-looking section.

## Assumptions

- This application has no authentication (per the project constitution); activities are
  attributed to a Team Member only where one is a natural, already-existing part of that specific
  change — today, that is only assignment changes (the team member being assigned or unassigned).
  Task creation, status changes, and priority changes are recorded without a personal attribution,
  since the app has no way to know who is acting and adding a "who is doing this" prompt to every
  such action is out of scope for this feature.
- A "Comments" capability was referenced in earlier informal notes for this feature but does not
  exist in this application; recording comment activity is explicitly out of scope here and would
  be introduced by a separate future feature, which could then extend this activity history with
  its own activity category.
- Activity records are append-only: no user-facing feature edits or deletes them.
- No retention limit, archiving policy, or pagination is defined for activity history, consistent
  with this application's demonstration scale.
- Activity history is scoped to a single task; there is no project-wide or cross-task activity
  feed in this feature.
