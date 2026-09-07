import { handler, ok } from "@/lib/api/respond";
import { apiRequirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { updateLeadFieldsSchema } from "@/lib/validation/leadSchemas";
import { getLead, updateLeadFields, archiveLead } from "@/lib/services/leadService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req, { params }) => {
  await apiRequirePermission(PERMISSIONS.LEADS_VIEW);
  const { id } = await params;
  return ok(await getLead(id));
});

export const PATCH = handler(async (req, { params }) => {
  const actor = await apiRequirePermission(PERMISSIONS.LEADS_MANAGE);
  const { id } = await params;
  const fields = updateLeadFieldsSchema.parse(await req.json());
  return ok(await updateLeadFields(id, fields, { actor }));
});

export const DELETE = handler(async (req, { params }) => {
  const actor = await apiRequirePermission(PERMISSIONS.LEADS_MANAGE);
  const { id } = await params;
  await archiveLead(id, { actor });
  return ok({ ok: true }, "Lead archived");
});
