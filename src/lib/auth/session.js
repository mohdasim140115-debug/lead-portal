import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { signSession, verifySession } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { ROLE_PERMISSIONS, STAFF_ROLES, ROLES } from "@/lib/constants";

const COOKIE = env.authCookieName;

export async function createSession(user) {
  const token = await signSession({
    sub: user._id.toString(),
    role: user.role,
    tv: user.tokenVersion ?? 0,
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: env.authSessionTtl,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

// Returns a plain session-user object or null. Verifies token AND DB state.
export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const payload = await verifySession(token);
  if (!payload?.sub) return null;

  await connectDB();
  const user = await User.findById(payload.sub).lean();
  if (!user || user.status !== "active") return null;
  if ((user.tokenVersion ?? 0) !== (payload.tv ?? 0)) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    buyerId: user.buyer ? user.buyer.toString() : null,
    permissions: ROLE_PERMISSIONS[user.role] || [],
    isStaff: STAFF_ROLES.includes(user.role),
    isBuyer: user.role === ROLES.BUYER,
  };
}

export function hasPermission(user, permission) {
  return !!user && user.permissions.includes(permission);
}
