import { Sidebar } from "@/components/nav/Sidebar";
import { Topbar } from "@/components/nav/Topbar";

export function AppShell({ user, groups, title, children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar groups={groups} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} title={title} />
        <main className="flex-1 p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
