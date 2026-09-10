import { Schema, model, type InferSchemaType } from "mongoose";

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export const STATUSES = ["Todo", "In Progress", "Done"] as const;

const taskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    status: { type: String, enum: STATUSES, default: "Todo" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "TeamMember", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type Task = InferSchemaType<typeof taskSchema> & { _id: string };

export const TaskModel = model("Task", taskSchema);
