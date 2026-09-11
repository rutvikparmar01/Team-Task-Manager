import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectTestDb, clearTestDb } from "../testApp";
import * as activityService from "../../src/services/activityService";

beforeAll(connectTestDb);
beforeEach(clearTestDb);
afterAll(async () => {
  await mongoose.disconnect();
});

describe("activityService", () => {
  it("records and lists activities for a task, newest first", async () => {
    const taskId = new mongoose.Types.ObjectId().toString();

    await activityService.recordActivity(taskId, "TaskCreated");
    await activityService.recordActivity(taskId, "StatusChanged", {
      fromStatus: "Todo",
      toStatus: "In Progress",
    });
    await activityService.recordActivity(taskId, "PriorityChanged", {
      fromPriority: "Medium",
      toPriority: "High",
    });

    const activities = await activityService.listActivitiesForTask(taskId);
    expect(activities.map((a) => a.category)).toEqual([
      "PriorityChanged",
      "StatusChanged",
      "TaskCreated",
    ]);
  });

  it("only returns activities for the requested task", async () => {
    const taskA = new mongoose.Types.ObjectId().toString();
    const taskB = new mongoose.Types.ObjectId().toString();
    await activityService.recordActivity(taskA, "TaskCreated");
    await activityService.recordActivity(taskB, "TaskCreated");

    const activities = await activityService.listActivitiesForTask(taskA);
    expect(activities).toHaveLength(1);
    expect(activities[0]?.taskId.toString()).toBe(taskA);
  });

  it("exposes no update or delete function (append-only by construction)", () => {
    expect((activityService as Record<string, unknown>).updateActivity).toBeUndefined();
    expect((activityService as Record<string, unknown>).deleteActivity).toBeUndefined();
  });
});
