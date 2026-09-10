import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("GET /api/projects/:projectId/tasks", () => {
  it("returns only tasks belonging to that project", async () => {
    const p1 = (await request(app).post("/api/projects").send({ name: "Project One" })).body._id;
    const p2 = (await request(app).post("/api/projects").send({ name: "Project Two" })).body._id;
    await request(app).post(`/api/projects/${p1}/tasks`).send({ title: "P1 task" });
    await request(app).post(`/api/projects/${p2}/tasks`).send({ title: "P2 task" });

    const res = await request(app).get(`/api/projects/${p1}/tasks`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("P1 task");
  });

  it("returns 404 for an unknown projectId", async () => {
    const res = await request(app).get(`/api/projects/${new mongoose.Types.ObjectId()}/tasks`);
    expect(res.status).toBe(404);
  });
});
