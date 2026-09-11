import { ActivityModel, type ACTIVITY_CATEGORIES } from "../models/Activity";

type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

interface ActivityFields {
  fromStatus?: string;
  toStatus?: string;
  fromPriority?: string;
  toPriority?: string;
  assigneeId?: string | null;
}

// Append-only by construction: this module exposes no update/delete function, per
// data-model.md's invariant that activity records are never edited or deleted.

export async function recordActivity(
  taskId: string,
  category: ActivityCategory,
  fields: ActivityFields = {},
) {
  return ActivityModel.create({ taskId, category, ...fields });
}

export async function listActivitiesForTask(taskId: string) {
  return ActivityModel.find({ taskId }).sort({ createdAt: -1 });
}
