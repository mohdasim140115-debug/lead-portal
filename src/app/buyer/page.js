import { Wallet, Search, Inbox, TrendingUp } from "lucide-react";
import { requireBuyer } from "@/lib/auth/guards";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function BuyerDashboard() {
  const user = await requireBuyer();

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0]}`}
        description="Your wallet, available leads and purchases will appear here."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wallet balance" value={formatCurrency(0)} icon={Wallet} tone="success" />
        <StatCard label="Available leads" value="0" icon={Search} tone="info" />
        <StatCard label="Purchased leads" value="0" icon={Inbox} tone="neutral" />
        <StatCard label="Conversion rate" value="0%" icon={TrendingUp} tone="neutral" />
      </div>
      <Card className="mt-4">
        <CardBody>
          <p className="text-sm text-muted-foreground">
            Your account is set up. Lead browsing and purchasing become available once the
            marketplace is live.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
