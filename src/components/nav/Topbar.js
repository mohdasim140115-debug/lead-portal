"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { ROLE_LABELS } from "@/lib/constants";

export function Topbar({ user, title }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-5">
      <h1 className="text-sm font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium leading-tight">{user.name}</p>
          <p className="text-xs text-muted-foreground leading-tight">
            {ROLE_LABELS[user.role] || user.role}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} disabled={busy} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
