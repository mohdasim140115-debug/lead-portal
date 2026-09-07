import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

// Standard success envelope: { success, data, message }
export function ok(data = null, message) {
  return NextResponse.json({ success: true, data, message: message ?? null });
}

export function created(data = null, message) {
  return NextResponse.json(
    { success: true, data, message: message ?? null },
    { status: 201 }
  );
}

// Standard error envelope: { success:false, message, error, data:null }
export function fail(status, message, error) {
  return NextResponse.json(
    { success: false, message, error: error ?? null, data: null },
    { status }
  );
}

// Wrap a route handler so thrown errors become predictable responses and
// internal details never leak to the client.
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(422, "Validation failed", err.flatten());
      }
      if (err instanceof ApiError) {
        if (err.status >= 500) logger.error(err.message, { err });
        return fail(err.status, err.message, err.details);
      }
      logger.error("Unhandled API error", { err });
      return fail(500, "Something went wrong. Please try again.");
    }
  };
}
