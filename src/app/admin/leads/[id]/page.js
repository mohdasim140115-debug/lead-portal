import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/session";
import { PERMISSIONS, LEAD_SOURCE_LABELS } from "@/lib/constants";
import { getLead } from "@/lib/services/leadService";
import { ApiError } from "@/lib/api/errors";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { LeadActions } from "@/components/leads/LeadActions";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Lead ${id.slice(-6)}` };
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children ?? "—"}</span>
    </div>
  );
}

export default async function LeadDetailPage({ params }) {
  const user = await requirePermission(PERMISSIONS.LEADS_VIEW);
  const { id } = await params;

  let lead;
  try {
    lead = await getLead(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const canPii = hasPermission(user, PERMISSIONS.LEADS_VIEW_PII);
  const canManage = hasPermission(user, PERMISSIONS.LEADS_MANAGE);
  const mask = (v) => (canPii ? v : v ? "••••••••" : "—");

  return (
    <>
      <Link href="/admin/leads" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{lead.name || "Unnamed lead"}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={lead.status} />
            <Badge tone={lead.quality === "high" ? "success" : lead.quality === "medium" ? "warning" : "neutral"}>
              {lead.quality} · {lead.score}
            </Badge>
            {lead.isDuplicate ? <Badge tone="warning">duplicate</Badge> : null}
          </div>
        </div>
        {canManage ? <LeadActions lead={lead} /> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Contact</CardTitle>{!canPii ? <span className="text-xs text-muted-foreground">masked — no PII permission</span> : null}</CardHeader>
            <CardBody>
              <Row label="Name">{mask(lead.name)}</Row>
              <Row label="Phone">{mask(lead.phone)}</Row>
              <Row label="Email">{mask(lead.email)}</Row>
              <Row label="WhatsApp">{mask(lead.whatsapp)}</Row>
              <Row label="Location">{[lead.city, lead.state, lead.country].filter(Boolean).join(", ")}</Row>
              <Row label="Pincode">{lead.pincode}</Row>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Requirement</CardTitle></CardHeader>
            <CardBody>
              <Row label="Category">{lead.category}</Row>
              <Row label="Subcategory">{lead.subcategory}</Row>
              <Row label="Budget">{lead.budget != null ? formatCurrency(lead.budget) : "—"}</Row>
              <div className="pt-2 text-sm">
                <p className="text-muted-foreground">Details</p>
                <p className="mt-1 whitespace-pre-wrap">{lead.requirement || "—"}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Attribution</CardTitle></CardHeader>
            <CardBody>
              <Row label="Source">{LEAD_SOURCE_LABELS[lead.source] || lead.source}</Row>
              <Row label="Campaign">{lead.attribution?.campaign}</Row>
              <Row label="Ad set / Ad">{[lead.attribution?.adSet, lead.attribution?.ad].filter(Boolean).join(" / ")}</Row>
              <Row label="Form / Landing">{[lead.attribution?.form, lead.attribution?.landingPage].filter(Boolean).join(" / ")}</Row>
              <Row label="UTM source / medium">{[lead.attribution?.utmSource, lead.attribution?.utmMedium].filter(Boolean).join(" / ")}</Row>
              <Row label="UTM campaign">{lead.attribution?.utmCampaign}</Row>
              <Row label="IP">{canPii ? lead.ip : "—"}</Row>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status history</CardTitle></CardHeader>
            <CardBody className="space-y-2.5">
              {lead.statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No changes recorded.</p>
              ) : (
                lead.statusHistory
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5"><StatusBadge status={h.to} /></span>
                      <div>
                        <p>
                          {h.from ? <span className="text-muted-foreground">from {h.from} · </span> : null}
                          {h.by?.name || h.byLabel || "system"}
                        </p>
                        {h.note ? <p className="text-muted-foreground">{h.note}</p> : null}
                        <p className="text-xs text-muted-foreground">{formatDate(h.at, true)}</p>
                      </div>
                    </div>
                  ))
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Pricing &amp; selling</CardTitle></CardHeader>
            <CardBody>
              <Row label="Price">{lead.price != null ? formatCurrency(lead.price) : "Not priced"}</Row>
              <Row label="Model"><span className="capitalize">{lead.sellingModel}</span></Row>
              <Row label="Buyer slots">{lead.buyerCount}/{lead.maxBuyers}</Row>
              <Row label="Verification"><span className="capitalize">{lead.verificationStatus}</span></Row>
            </CardBody>
          </Card>

          {lead.duplicateOf ? (
            <Card>
              <CardHeader><CardTitle>Duplicate of</CardTitle></CardHeader>
              <CardBody>
                <Link href={`/admin/leads/${lead.duplicateOf.id}`} className="text-sm text-primary hover:underline">
                  {lead.duplicateOf.name || "Original lead"}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lead.duplicateOf.status} · {formatDate(lead.duplicateOf.createdAt, true)}
                </p>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle>Meta</CardTitle></CardHeader>
            <CardBody>
              <Row label="Created">{formatDate(lead.createdAt, true)}</Row>
              <Row label="Updated">{formatDate(lead.updatedAt, true)}</Row>
              <Row label="Added by">{lead.createdBy?.name || "System / ingestion"}</Row>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
