import { handler, ok } from "@/lib/api/respond";
import { ApiError } from "@/lib/api/errors";
import { loginSchema } from "@/lib/validation/authSchemas";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { recordAudit } from "@/lib/services/auditService";
import { STAFF_ROLES } from "@/lib/constants";

export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, { limit: 10, windowMs: 5 * 60_000 });
  if (!rl.allowed) throw new ApiError(429, "Too many attempts. Try again later.");

  const { email, password } = loginSchema.parse(await req.json());

  await connectDB();
  const user = await User.findOne({ email }).select("+passwordHash");

  const okPass = user && (await verifyPassword(password, user.passwordHash));
  if (!user || !okPass || user.status !== "active") {
    // Uniform message — do not reveal which check failed.
    throw new ApiError(401, "Invalid email or password");
  }

  await createSession(user);
  user.lastLoginAt = new Date();
  await user.save();

  await recordAudit({
    actor: { id: user._id.toString(), email: user.email, role: user.role },
    action: "auth.login",
    entityType: "User",
    entityId: user._id,
    ip,
  });

  const redirect = STAFF_ROLES.includes(user.role) ? "/admin" : "/buyer";
  return ok({ user: user.toSafeJSON(), redirect });
});
