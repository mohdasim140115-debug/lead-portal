import mongoose from "mongoose";
import { env } from "@/lib/env";

// Cache the connection across hot reloads / serverless invocations.
let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.mongodbUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

// Register all models once so refs resolve regardless of import order.
export async function getModels() {
  await connectDB();
  return import("@/lib/db/models");
}
