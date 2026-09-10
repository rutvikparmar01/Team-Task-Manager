import { TeamMemberModel } from "../models/TeamMember";
import { NotFoundError } from "../errors";
import type { CreateTeamMemberInput } from "../validation/teamMember";

export async function createTeamMember(input: CreateTeamMemberInput) {
  return TeamMemberModel.create(input);
}

export async function listTeamMembers() {
  return TeamMemberModel.find().sort({ createdAt: 1 });
}

export async function assertTeamMemberExists(teamMemberId: string) {
  const teamMember = await TeamMemberModel.findById(teamMemberId);
  if (!teamMember) {
    throw new NotFoundError(`Team member ${teamMemberId} not found.`);
  }
  return teamMember;
}
