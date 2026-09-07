import { Users, UserCheck, Wallet, TrendingUp } from "lucide-react";
import { requireStaff } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody } from "@/components/ui/Card";
import { ROLES } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireStaff();
  await connectDB();

  const [staffCount, buyerCount] = await Promise.all([
    User.countDocuments({ role: { $ne: ROLES.BUYER } }),
    User.countDocuments({ role: ROLES.BUYER }),
  ]);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Lead and revenue metrics populate here as sources are connected and leads flow in."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={formatNumber(0)} icon={Users} tone="info" />
        <StatCard label="Available leads" value={formatNumber(0)} icon={UserCheck} tone="success" />
        <StatCard label="Revenue (30d)" value="₹0" icon={Wallet} tone="warning" />
        <StatCard label="Conversion rate" value="0%" icon={TrendingUp} tone="neutral" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-sm font-semibold">Team</p>
            <div className="mt-3 flex gap-8">
              <div>
                <p className="text-2xl font-semibold">{formatNumber(staffCount)}</p>
                <p className="text-xs text-muted-foreground">Staff users</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{formatNumber(buyerCount)}</p>
                <p className="text-xs text-muted-foreground">Buyer accounts</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold">Next steps</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>• Connect a lead source (Meta, Google, landing page or CSV)</li>
              <li>• Add buyers and configure their categories &amp; locations</li>
              <li>• Define pricing rules</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
