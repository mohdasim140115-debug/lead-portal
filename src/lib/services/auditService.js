import { connectDB } from "@/lib/db/mongoose";
import AuditLog from "@/lib/db/models/AuditLog";
import { logger } from "@/lib/logger";

// Fire-and-forget audit write. Never throws into the caller's flow.
export async function recordAudit({
  actor,
  action,
  entityType,
  entityId,
  before,
  after,
  metadata,
  ip,
}) {
  try {
    await connectDB();
    await AuditLog.create({
      actor: actor?.id || null,
      actorEmail: actor?.email || null,
      actorRole: actor?.role || null,
      action,
      entityType,
      entityId,
      before,
      after,
      metadata,
      ip,
    });
  } catch (err) {
    logger.error("Failed to write audit log", { err, action });
  }
}
