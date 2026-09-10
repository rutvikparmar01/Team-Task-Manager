import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("GET /api/projects/:projectId/progress", () => {
  it("returns the correct ratio for a mix of task statuses", async () => {
    const projectId = (await request(app).post("/api/projects").send({ name: "Demo" })).body._id;
    const tasks = [];
    for (let i = 0; i < 4; i++) {
      tasks.push(
        (await request(app).post(`/api/projects/${projectId}/tasks`).send({ title: `T${i}` }))
          .body,
      );
    }
    await request(app).patch(`/api/tasks/${tasks[0]._id}`).send({ status: "Done" });

    const res = await request(app).get(`/api/projects/${projectId}/progress`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ totalTasks: 4, doneTasks: 1, progress: 0.25 });
  });

  it("returns a null progress with zero totals for a project with no tasks", async () => {
    const projectId = (await request(app).post("/api/projects").send({ name: "Empty" })).body._id;
    const res = await request(app).get(`/api/projects/${projectId}/progress`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ totalTasks: 0, doneTasks: 0, progress: null });
  });

  it("returns 404 for an unknown projectId", async () => {
    const res = await request(app).get(
      `/api/projects/${new mongoose.Types.ObjectId()}/progress`,
    );
    expect(res.status).toBe(404);
  });
});
