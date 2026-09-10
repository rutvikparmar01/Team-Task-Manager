import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("GET /api/projects/:projectId/tasks filtering", () => {
  async function seedProject() {
    const projectId = (await request(app).post("/api/projects").send({ name: "Demo" })).body._id;
    const t1 = (
      await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .send({ title: "Low todo", priority: "Low" })
    ).body;
    const t2 = (
      await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .send({ title: "High todo", priority: "High" })
    ).body;
    await request(app).patch(`/api/tasks/${t2._id}`).send({ status: "Done" });
    return { projectId, t1, t2 };
  }

  it("filters by status alone", async () => {
    const { projectId } = await seedProject();
    const res = await request(app).get(`/api/projects/${projectId}/tasks`).query({ status: "Done" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("Done");
  });

  it("filters by priority alone", async () => {
    const { projectId } = await seedProject();
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ priority: "Low" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].priority).toBe("Low");
  });

  it("filters by status and priority together", async () => {
    const { projectId } = await seedProject();
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ status: "Done", priority: "High" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("returns an empty array when no task matches", async () => {
    const { projectId } = await seedProject();
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ status: "In Progress" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
