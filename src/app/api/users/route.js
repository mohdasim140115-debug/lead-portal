import { handler, ok, created } from "@/lib/api/respond";
import { apiRequirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { parsePagination } from "@/lib/api/parsePagination";
import { listStaff, createStaff } from "@/lib/services/userService";
import { createStaffSchema } from "@/lib/validation/authSchemas";

export const runtime = "nodejs";

export const GET = handler(async (req) => {
  await apiRequirePermission(PERMISSIONS.USERS_MANAGE);
  const { searchParams } = new URL(req.url);
  const { page, pageSize } = parsePagination(searchParams);
  const data = await listStaff({ page, pageSize, q: searchParams.get("q")?.trim() });
  return ok(data);
});

export const POST = handler(async (req) => {
  const actor = await apiRequirePermission(PERMISSIONS.USERS_MANAGE);
  const data = createStaffSchema.parse(await req.json());
  const user = await createStaff(data, actor);
  return created({ user });
});
