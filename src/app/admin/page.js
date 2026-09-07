import Link from "next/link";
import { Users, UserCheck, CopyX, TrendingUp } from "lucide-react";
import { requireStaff } from "@/lib/auth/guards";
import { getLeadStats, getRecentLeads } from "@/lib/services/dashboardService";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard({ searchParams }) {
  const user = await requireStaff();
  const sp = await searchParams;
  const [stats, recent] = await Promise.all([getLeadStats(), getRecentLeads()]);

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} />
      {sp?.denied ? (
        <div className="mb-4 rounded-md border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          You don&apos;t have access to that section.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={formatNumber(stats.total)} sublabel={`${formatNumber(stats.today)} today`} icon={Users} tone="info" />
        <StatCard label="Available" value={formatNumber(stats.available)} sublabel={`${formatNumber(stats.new)} new · ${formatNumber(stats.verified)} verified`} icon={UserCheck} tone="success" />
        <StatCard label="Sold" value={formatNumber(stats.sold)} icon={TrendingUp} tone="warning" />
        <StatCard label="Duplicates" value={formatNumber(stats.duplicate)} icon={CopyX} tone="neutral" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent leads</CardTitle>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardBody className="p-0">
            {recent.length === 0 ? (
              <div className="p-5">
                <EmptyState title="No leads yet" description="Add a lead or import a CSV to get started." />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[l.category, l.city].filter(Boolean).join(" · ") || "—"} · {LEAD_SOURCE_LABELS[l.source] || l.source}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <StatusBadge status={l.status} />
                        <span className="text-xs text-muted-foreground">{formatDate(l.createdAt, true)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leads by source</CardTitle></CardHeader>
          <CardBody>
            {stats.bySource.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.bySource.map((s) => {
                  const pct = stats.total ? Math.round((s.count / stats.total) * 100) : 0;
                  return (
                    <li key={s.source}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{LEAD_SOURCE_LABELS[s.source] || s.source}</span>
                        <span className="text-muted-foreground">{formatNumber(s.count)} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
