import { handler, ok } from "@/lib/api/respond";
import { apiRequirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { updateStaff } from "@/lib/services/userService";
import { updateStaffSchema } from "@/lib/validation/authSchemas";

export const runtime = "nodejs";

export const PATCH = handler(async (req, { params }) => {
  const actor = await apiRequirePermission(PERMISSIONS.USERS_MANAGE);
  const { id } = await params;
  const data = updateStaffSchema.parse(await req.json());
  const user = await updateStaff(id, data, actor);
  return ok({ user });
});
