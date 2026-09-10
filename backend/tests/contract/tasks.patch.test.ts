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
  const projectId = (await request(app).post("/api/projects").send({ name: "Demo" })).body._id;
  const task = (await request(app).post(`/api/projects/${projectId}/tasks`).send({ title: "T" }))
    .body;
  return task;
}

describe("PATCH /api/tasks/:taskId", () => {
  it("moves status through Todo -> In Progress -> Done -> Todo", async () => {
    const task = await createTask();

    let res = await request(app).patch(`/api/tasks/${task._id}`).send({ status: "In Progress" });
    expect(res.body.status).toBe("In Progress");

    res = await request(app).patch(`/api/tasks/${task._id}`).send({ status: "Done" });
    expect(res.body.status).toBe("Done");

    res = await request(app).patch(`/api/tasks/${task._id}`).send({ status: "Todo" });
    expect(res.body.status).toBe("Todo");
  });

  it("treats setting status to its current value as a no-op with no error", async () => {
    const task = await createTask();
    const res = await request(app).patch(`/api/tasks/${task._id}`).send({ status: "Todo" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Todo");
  });

  it("rejects an invalid status value with 400", async () => {
    const task = await createTask();
    const res = await request(app).patch(`/api/tasks/${task._id}`).send({ status: "Archived" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown taskId", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${new mongoose.Types.ObjectId()}`)
      .send({ status: "Done" });
    expect(res.status).toBe(404);
  });

  it("updates priority alone", async () => {
    const task = await createTask();
    const res = await request(app).patch(`/api/tasks/${task._id}`).send({ priority: "High" });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe("High");
  });

  it("updates assigneeId alone, and can clear it back to null", async () => {
    const task = await createTask();
    const memberId = (await request(app).post("/api/team-members").send({ name: "Ada" })).body
      ._id;

    let res = await request(app).patch(`/api/tasks/${task._id}`).send({ assigneeId: memberId });
    expect(res.status).toBe(200);
    expect(res.body.assigneeId).toBe(memberId);

    res = await request(app).patch(`/api/tasks/${task._id}`).send({ assigneeId: null });
    expect(res.status).toBe(200);
    expect(res.body.assigneeId).toBeFalsy();
  });

  it("returns 404 when assigneeId does not reference an existing team member", async () => {
    const task = await createTask();
    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .send({ assigneeId: new mongoose.Types.ObjectId().toString() });
    expect(res.status).toBe(404);
  });
});
