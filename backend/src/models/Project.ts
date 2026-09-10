import { Schema, model, type InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type Project = InferSchemaType<typeof projectSchema> & { _id: string };

export const ProjectModel = model("Project", projectSchema);
