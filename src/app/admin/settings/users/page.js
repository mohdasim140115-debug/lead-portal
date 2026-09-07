import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/constants";
import { listStaff } from "@/lib/services/userService";
import { PageHeader } from "@/components/PageHeader";
import { UsersManager } from "@/components/users/UsersManager";

export const metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }) {
  const me = await requirePermission(PERMISSIONS.USERS_MANAGE);
  const sp = await searchParams;
  const page = parseInt(sp?.page || "1", 10) || 1;
  const initial = await listStaff({ page, pageSize: 25, q: sp?.q?.trim() });

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage staff accounts and their roles. Buyer logins are created from the Buyers section."
      />
      <UsersManager initial={initial} currentUserId={me.id} />
    </>
  );
}
