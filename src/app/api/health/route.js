import { handler, ok } from "@/lib/api/respond";
import { connectDB } from "@/lib/db/mongoose";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await connectDB();
  return ok({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});
