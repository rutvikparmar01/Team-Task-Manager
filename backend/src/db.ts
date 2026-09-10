import mongoose from "mongoose";

// Cached across invocations within the same warm serverless container (and a no-op in a
// long-running process, where this only ever runs once). Without this, each Vercel Serverless
// Function invocation would open a fresh MongoDB connection, quickly exhausting Atlas's
// connection limit under any real traffic.
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDb(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).catch((err) => {
      // Allow a later call to retry instead of being stuck with a permanently rejected cache.
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  connectionPromise = null;
}
