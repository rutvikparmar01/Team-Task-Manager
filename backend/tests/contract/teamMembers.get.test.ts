import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("GET /api/team-members", () => {
  it("returns all created team members", async () => {
    await request(app).post("/api/team-members").send({ name: "Ada" });
    await request(app).post("/api/team-members").send({ name: "Grace" });

    const res = await request(app).get("/api/team-members");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
