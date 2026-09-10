import { Schema, model, type InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Case- and accent-insensitive uniqueness (strength 2 collation), paired with the
// application-level pre-check in projectService — see specs/002-project-management/research.md.
projectSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export type Project = InferSchemaType<typeof projectSchema> & { _id: string };

export const ProjectModel = model("Project", projectSchema);
