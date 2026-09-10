// Vercel Serverless Function entry point. Vercel treats any file under a root-level `api/`
// directory as a function; combined with the rewrite in vercel.json, every `/api/*` request on
// the deployed site is routed to this single function, which delegates to the same Express app
// used for local development (backend/src/app.ts) — no separate serverless-specific routing.
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../backend/src/app";
import { connectDb } from "../backend/src/db";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set.");
}

// Created once per warm container, not per invocation.
const app = createApp();
const ready = connectDb(MONGODB_URI);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  app(req, res);
}
