import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";
import { CsvImporter } from "@/components/leads/CsvImporter";

export const metadata = { title: "CSV Import" };

export default async function ImportsPage() {
  await requirePermission(PERMISSIONS.LEADS_MANAGE);
  return (
    <>
      <PageHeader
        title="CSV Import"
        description="Upload a CSV of leads, map the columns, preview, then import. Duplicates are flagged, not dropped."
      />
      <CsvImporter />
    </>
  );
}
