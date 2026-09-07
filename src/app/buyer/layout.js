import { requireBuyer } from "@/lib/auth/guards";
import { AppShell } from "@/components/nav/AppShell";
import { BUYER_NAV } from "@/components/nav/buyerNav";

export const metadata = { title: "Buyer Portal" };

export default async function BuyerLayout({ children }) {
  const user = await requireBuyer();
  return (
    <AppShell user={user} groups={BUYER_NAV} title="Buyer Portal">
      {children}
    </AppShell>
  );
}
