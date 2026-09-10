import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { HttpError } from "./errors";
import { projectsRouter } from "./api/projects";
import { tasksRouter } from "./api/tasks";
import { teamMembersRouter } from "./api/teamMembers";

export function createApp() {
  const app = express();

  // CORS_ORIGIN restricts allowed origins in production (e.g. the deployed frontend's URL).
  // Left unset, this remains permissive for local development, where the frontend and backend
  // run on different ports (5173/3001) and Vite's dev proxy isn't in play for direct API calls.
  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(cors(corsOrigin ? { origin: corsOrigin } : undefined));
  app.use(express.json());

  app.use("/api/projects", projectsRouter);
  app.use("/api/team-members", teamMembersRouter);
  app.use("/api", tasksRouter);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: `Not found: ${req.method} ${req.path}` });
  });

  // Centralized error handler — every error becomes { message: string } per contracts/api.md
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      const message = err.issues[0]?.message ?? "Invalid input.";
      res.status(400).json({ message });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  });

  return app;
}
