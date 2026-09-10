import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

async function createProject(name = "Demo") {
  const res = await request(app).post("/api/projects").send({ name });
  return res.body._id as string;
}

describe("POST /api/projects/:projectId/tasks", () => {
  it("creates a task with status Todo and defaults priority to Medium", async () => {
    const projectId = await createProject();
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: "Write report" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Write report", status: "Todo", priority: "Medium" });
  });

  it("rejects a blank title with 400", async () => {
    const projectId = await createProject();
    const res = await request(app).post(`/api/projects/${projectId}/tasks`).send({ title: "  " });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title is required/i);
  });

  it("returns 404 for an unknown projectId", async () => {
    const res = await request(app)
      .post(`/api/projects/${new mongoose.Types.ObjectId()}/tasks`)
      .send({ title: "Orphan task" });
    expect(res.status).toBe(404);
  });

  it("accepts an explicit priority and assignee", async () => {
    const projectId = await createProject();
    const memberRes = await request(app).post("/api/team-members").send({ name: "Ada" });
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: "Review PR", priority: "High", assigneeId: memberRes.body._id });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ priority: "High", assigneeId: memberRes.body._id });
  });
});
