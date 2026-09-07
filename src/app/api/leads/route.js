import { handler, ok, created } from "@/lib/api/respond";
import { apiRequirePermission } from "@/lib/auth/guards";
import { PERMISSIONS, LEAD_SOURCES } from "@/lib/constants";
import { parsePagination } from "@/lib/api/parsePagination";
import { listLeadsQuerySchema, createLeadSchema } from "@/lib/validation/leadSchemas";
import { listLeads, createLead } from "@/lib/services/leadService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req) => {
  await apiRequirePermission(PERMISSIONS.LEADS_VIEW);
  const { searchParams } = new URL(req.url);
  const { page, pageSize } = parsePagination(searchParams);
  const query = listLeadsQuerySchema.parse(Object.fromEntries(searchParams));
  const data = await listLeads({ ...query, page, pageSize });
  return ok(data);
});

export const POST = handler(async (req) => {
  const actor = await apiRequirePermission(PERMISSIONS.LEADS_MANAGE);
  const input = createLeadSchema.parse(await req.json());
  const { lead, duplicate } = await createLead(input, {
    actor,
    source: input.source || LEAD_SOURCES.MANUAL,
  });
  return created(
    { id: lead._id.toString(), status: lead.status, duplicate },
    duplicate ? "Lead saved and flagged as a possible duplicate" : "Lead created"
  );
});
