import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/team-members", () => {
  it("creates a team member with a valid name", async () => {
    const res = await request(app).post("/api/team-members").send({ name: "Ada" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Ada" });
  });

  it("rejects a blank name with 400", async () => {
    const res = await request(app).post("/api/team-members").send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name is required/i);
  });
});
