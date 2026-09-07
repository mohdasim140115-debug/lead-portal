import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

// Maps lead / payment / purchase statuses to a visual tone.
const STATUS_TONE = {
  new: "info", verified: "info", available: "success", assigned: "warning",
  purchased: "success", contacted: "info", follow_up: "warning",
  interested: "info", converted: "success", not_interested: "neutral",
  wrong_number: "danger", duplicate: "warning", rejected: "danger",
  refunded: "danger", closed: "neutral",
  paid: "success", created: "warning", failed: "danger",
  active: "success", disabled: "neutral", refund_requested: "warning",
  low: "neutral", medium: "warning", high: "success",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return <Badge tone={STATUS_TONE[status] || "neutral"}>{String(status).replace(/_/g, " ")}</Badge>;
}
