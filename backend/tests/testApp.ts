import mongoose from "mongoose";
import { createApp } from "../src/app";

// Each test file gets its own connection (mongoose caches by URI internally is fine here
// since all tests share one in-memory server instance from tests/setup.ts's global setup).
export async function connectTestDb() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

export async function clearTestDb() {
  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

export const app = createApp();
