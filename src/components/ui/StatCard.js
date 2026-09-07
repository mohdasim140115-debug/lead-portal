import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, sublabel, icon: Icon, tone = "neutral" }) {
  const toneClass = {
    neutral: "text-muted-foreground bg-muted",
    info: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-danger bg-danger/10",
  }[tone];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {sublabel ? <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("rounded-md p-2", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
