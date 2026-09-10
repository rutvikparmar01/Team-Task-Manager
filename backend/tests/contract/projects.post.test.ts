import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/projects", () => {
  it("creates a project with a valid name", async () => {
    const res = await request(app).post("/api/projects").send({ name: "Demo Project" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Demo Project" });
  });

  it("rejects a missing name with 400 and a specific message", async () => {
    const res = await request(app).post("/api/projects").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name is required/i);
  });

  it("rejects a whitespace-only name the same as an empty one", async () => {
    const res = await request(app).post("/api/projects").send({ name: "   " });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name is required/i);
  });

  it("rejects a name shorter than 3 characters after trimming", async () => {
    const res = await request(app).post("/api/projects").send({ name: "Ab" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 3 characters/i);

    const list = await request(app).get("/api/projects");
    expect(list.body).toHaveLength(0);
  });

  it("rejects a name longer than 100 characters after trimming", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "A".repeat(101) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at most 100 characters/i);

    const list = await request(app).get("/api/projects");
    expect(list.body).toHaveLength(0);
  });

  it("accepts a name of exactly 3 characters", async () => {
    const res = await request(app).post("/api/projects").send({ name: "Abc" });
    expect(res.status).toBe(201);
  });

  it("accepts a name of exactly 100 characters", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ name: "A".repeat(100) });
    expect(res.status).toBe(201);
  });

  it("rejects an exact duplicate name", async () => {
    await request(app).post("/api/projects").send({ name: "Marketing Site" });
    const res = await request(app).post("/api/projects").send({ name: "Marketing Site" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);

    const list = await request(app).get("/api/projects");
    expect(list.body).toHaveLength(1);
  });

  it("rejects a case-different duplicate name", async () => {
    await request(app).post("/api/projects").send({ name: "Marketing Site" });
    const res = await request(app).post("/api/projects").send({ name: "marketing site" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);

    const list = await request(app).get("/api/projects");
    expect(list.body).toHaveLength(1);
  });

  it("rejects a whitespace-different duplicate name", async () => {
    await request(app).post("/api/projects").send({ name: "Marketing Site" });
    const res = await request(app).post("/api/projects").send({ name: "  Marketing Site  " });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);

    const list = await request(app).get("/api/projects");
    expect(list.body).toHaveLength(1);
  });
});
