import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { listLeads } from "@/lib/services/leadService";
import { listCategories } from "@/lib/services/categoryService";
import { PageHeader } from "@/components/PageHeader";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadPagination } from "@/components/leads/LeadPagination";
import { AddLeadButton } from "@/components/leads/AddLeadButton";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const CLEAN = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export default async function LeadsPage({ searchParams }) {
  await requirePermission(PERMISSIONS.LEADS_VIEW);
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1);
  const params = {
    page,
    pageSize: 25,
    q: CLEAN(sp?.q),
    status: CLEAN(sp?.status),
    source: CLEAN(sp?.source),
    category: CLEAN(sp?.category),
    quality: CLEAN(sp?.quality),
    from: CLEAN(sp?.from),
    to: CLEAN(sp?.to),
    sort: CLEAN(sp?.sort),
    dir: CLEAN(sp?.dir),
  };

  const [data, categories] = await Promise.all([listLeads(params), listCategories()]);

  return (
    <>
      <PageHeader
        title="Leads"
        description="Every lead captured across sources. Contact details are masked in the list."
        actions={<AddLeadButton categories={categories.map((c) => c.name)} />}
      />
      <LeadFilters categories={categories.map((c) => c.name)} />
      <div className="mt-4">
        <LeadTable rows={data.items} />
        <LeadPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
        />
      </div>
    </>
  );
}
