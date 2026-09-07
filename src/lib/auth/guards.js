import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, hasPermission } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";

// ---- For Server Components / pages (redirect on failure) ----

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (!user.isStaff) redirect("/buyer");
  return user;
}

export async function requireBuyer() {
  const user = await requireUser();
  if (!user.isBuyer) redirect("/admin");
  return user;
}

export async function requirePermission(permission) {
  const user = await requireStaff();
  if (!hasPermission(user, permission)) redirect("/admin?denied=1");
  return user;
}

// ---- For Route Handlers (throw ApiError on failure) ----

export async function apiRequireUser() {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Authentication required");
  return user;
}

export async function apiRequireStaff() {
  const user = await apiRequireUser();
  if (!user.isStaff) throw new ApiError(403, "Staff access required");
  return user;
}

export async function apiRequireBuyer() {
  const user = await apiRequireUser();
  if (!user.isBuyer) throw new ApiError(403, "Buyer access required");
  return user;
}

export async function apiRequirePermission(permission) {
  const user = await apiRequireStaff();
  if (!hasPermission(user, permission)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  return user;
}
