import Link from "next/link";
import { Users } from "lucide-react";
import { Table, Thead, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export function LeadTable({ rows }) {
  if (!rows.length) {
    return (
      <EmptyState
        icon={Users}
        title="No leads match these filters"
        description="Try widening the date range or clearing filters. New leads appear here as sources send them in."
      />
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Lead</Th>
          <Th>Location</Th>
          <Th>Category</Th>
          <Th>Source</Th>
          <Th>Quality</Th>
          <Th>Price</Th>
          <Th>Status</Th>
          <Th>Created</Th>
        </Tr>
      </Thead>
      <tbody>
        {rows.map((l) => (
          <Tr key={l.id} className="cursor-default">
            <Td>
              <Link href={`/admin/leads/${l.id}`} className="font-medium text-primary hover:underline">
                {l.name || "Unnamed lead"}
              </Link>
              <div className="text-xs text-muted-foreground">
                {l.phoneMasked || l.email || "—"}
                {l.isDuplicate ? <Badge tone="warning" className="ml-2">dup</Badge> : null}
              </div>
            </Td>
            <Td className="text-muted-foreground">
              {[l.city, l.state].filter(Boolean).join(", ") || "—"}
            </Td>
            <Td className="text-muted-foreground">{l.category || "—"}</Td>
            <Td>{LEAD_SOURCE_LABELS[l.source] || l.source}</Td>
            <Td>
              <span className="inline-flex items-center gap-1.5">
                <Badge tone={l.quality === "high" ? "success" : l.quality === "medium" ? "warning" : "neutral"}>
                  {l.quality}
                </Badge>
                <span className="text-xs text-muted-foreground tabular-nums">{l.score}</span>
              </span>
            </Td>
            <Td className="tabular-nums">{l.price != null ? formatCurrency(l.price) : "—"}</Td>
            <Td><StatusBadge status={l.status} /></Td>
            <Td className="text-muted-foreground">{formatDate(l.createdAt, true)}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
