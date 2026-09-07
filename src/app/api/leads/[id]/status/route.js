import { handler, ok } from "@/lib/api/respond";
import { apiRequirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { updateLeadStatusSchema } from "@/lib/validation/leadSchemas";
import { updateLeadStatus } from "@/lib/services/leadService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (req, { params }) => {
  const actor = await apiRequirePermission(PERMISSIONS.LEADS_MANAGE);
  const { id } = await params;
  const { status, note } = updateLeadStatusSchema.parse(await req.json());
  return ok(await updateLeadStatus(id, status, { actor, note }));
});
