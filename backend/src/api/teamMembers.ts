import { Router } from "express";
import { createTeamMemberSchema } from "../validation/teamMember";
import * as teamMemberService from "../services/teamMemberService";

export const teamMembersRouter = Router();

teamMembersRouter.get("/", async (_req, res, next) => {
  try {
    const teamMembers = await teamMemberService.listTeamMembers();
    res.status(200).json(teamMembers);
  } catch (err) {
    next(err);
  }
});

teamMembersRouter.post("/", async (req, res, next) => {
  try {
    const input = createTeamMemberSchema.parse(req.body);
    const teamMember = await teamMemberService.createTeamMember(input);
    res.status(201).json(teamMember);
  } catch (err) {
    next(err);
  }
});
