import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app, connectTestDb, clearTestDb } from "../testApp";
import mongoose from "mongoose";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("GET /api/projects", () => {
  it("returns all created projects", async () => {
    await request(app).post("/api/projects").send({ name: "Alpha" });
    await request(app).post("/api/projects").send({ name: "Beta" });

    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((p: { name: string }) => p.name).sort()).toEqual(["Alpha", "Beta"]);
  });
});
