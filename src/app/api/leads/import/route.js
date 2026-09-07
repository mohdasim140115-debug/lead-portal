import { handler, ok } from "@/lib/api/respond";
import { apiRequirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { importSchema } from "@/lib/validation/leadSchemas";
import { dryRunImport, commitImport } from "@/lib/services/importService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const POST = handler(async (req) => {
  const actor = await apiRequirePermission(PERMISSIONS.LEADS_MANAGE);
  const { csvText, mapping, mode } = importSchema.parse(await req.json());
  if (mode === "dry_run") {
    return ok(await dryRunImport({ csvText, mapping }));
  }
  return ok(await commitImport({ csvText, mapping }, { actor }), "Import complete");
});
