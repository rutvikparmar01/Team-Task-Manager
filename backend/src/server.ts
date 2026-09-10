import "dotenv/config";
import { createApp } from "./app";
import { connectDb } from "./db";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/team-task-manager";

async function main() {
  await connectDb(MONGODB_URI);
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
