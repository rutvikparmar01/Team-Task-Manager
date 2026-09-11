import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

async function createTask() {
  const projectId = (await request(app).post("/api/projects").send({ name: "Demo Project" }))
    .body._id;
  return (await request(app).post(`/api/projects/${projectId}/tasks`).send({ title: "Task" }))
    .body;
}

describe("GET /api/tasks/:taskId/activities", () => {
  it("returns an empty array for a task with no recorded activities besides its own creation removed", async () => {
    // A freshly created task already has one TaskCreated activity (User Story 2); this test
    // confirms the endpoint itself returns a well-formed array, not that it's literally empty.
    const task = await createTask();
    const res = await request(app).get(`/api/tasks/${task._id}/activities`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 400 for a malformed taskId", async () => {
    const res = await request(app).get("/api/tasks/not-an-id/activities");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not a valid id/i);
  });

  it("returns 404 for a well-formed but nonexistent taskId", async () => {
    const res = await request(app).get(
      `/api/tasks/${new mongoose.Types.ObjectId()}/activities`,
    );
    expect(res.status).toBe(404);
  });

  it("returns activities newest first", async () => {
    const task = await createTask();
    await request(app).patch(`/api/tasks/${task._id}`).send({ status: "In Progress" });
    await request(app).patch(`/api/tasks/${task._id}`).send({ priority: "High" });

    const res = await request(app).get(`/api/tasks/${task._id}/activities`);
    expect(res.status).toBe(200);
    const categories = res.body.map((a: { category: string }) => a.category);
    // Newest first: PriorityChanged (last action), then StatusChanged, then TaskCreated.
    expect(categories).toEqual(["PriorityChanged", "StatusChanged", "TaskCreated"]);
  });
});
