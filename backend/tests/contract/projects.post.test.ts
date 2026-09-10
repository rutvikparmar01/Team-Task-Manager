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
});
