import { requireStaff } from "@/lib/auth/guards";
import { AppShell } from "@/components/nav/AppShell";
import { ADMIN_NAV, filterNav } from "@/components/nav/adminNav";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }) {
  const user = await requireStaff();
  const groups = filterNav(ADMIN_NAV, user);
  return (
    <AppShell user={user} groups={groups} title="Admin Console">
      {children}
    </AppShell>
  );
}
