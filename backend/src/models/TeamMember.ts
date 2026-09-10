import { Schema, model, type InferSchemaType } from "mongoose";

const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type TeamMember = InferSchemaType<typeof teamMemberSchema> & { _id: string };

export const TeamMemberModel = model("TeamMember", teamMemberSchema);
