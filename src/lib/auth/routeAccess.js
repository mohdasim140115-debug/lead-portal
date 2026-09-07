import { ROLE_PERMISSIONS, PERMISSIONS as P } from "@/lib/constants";

// Path prefix → permission required. Longest match wins. Edge-safe (no DB).
// The page-level guards remain the source of truth; this is a fast front gate.
const RULES = [
  ["/admin/settings/users", P.USERS_MANAGE],
  ["/admin/settings", P.SETTINGS_MANAGE],
  ["/admin/leads", P.LEADS_VIEW],
  ["/admin/sources/imports", P.LEADS_MANAGE],
  ["/admin/sources", P.SETTINGS_MANAGE],
  ["/admin/buyers", P.BUYERS_VIEW],
  ["/admin/sales/transactions", P.FINANCE_MANAGE],
  ["/admin/sales/refunds", P.FINANCE_MANAGE],
  ["/admin/sales/invoices", P.FINANCE_MANAGE],
  ["/admin/sales", P.SALES_VIEW],
  ["/admin/pricing", P.PRICING_MANAGE],
  ["/admin/analytics", P.ANALYTICS_VIEW],
  ["/admin/audit", P.AUDIT_VIEW],
];

export function requiredPermissionForPath(pathname) {
  let match = null;
  for (const [prefix, perm] of RULES) {
    if ((pathname === prefix || pathname.startsWith(prefix + "/")) &&
        (!match || prefix.length > match[0].length)) {
      match = [prefix, perm];
    }
  }
  return match ? match[1] : null;
}

export function roleHasPermission(role, permission) {
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}
