import { Schema, model, type InferSchemaType } from "mongoose";
import { PRIORITIES, STATUSES } from "./Task";

export const ACTIVITY_CATEGORIES = [
  "TaskCreated",
  "AssigneeChanged",
  "StatusChanged",
  "PriorityChanged",
] as const;

const activitySchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    category: { type: String, enum: ACTIVITY_CATEGORIES, required: true },
    // Present only when category is "StatusChanged".
    fromStatus: { type: String, enum: STATUSES },
    toStatus: { type: String, enum: STATUSES },
    // Present only when category is "PriorityChanged".
    fromPriority: { type: String, enum: PRIORITIES },
    toPriority: { type: String, enum: PRIORITIES },
    // Present only when category is "AssigneeChanged"; null represents "unassigned".
    assigneeId: { type: Schema.Types.ObjectId, ref: "TeamMember", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Every query is "activities for this task, newest first" — one compound index serves both.
activitySchema.index({ taskId: 1, createdAt: -1 });

export type Activity = InferSchemaType<typeof activitySchema> & { _id: string };

export const ActivityModel = model("Activity", activitySchema);
