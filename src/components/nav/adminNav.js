import { PERMISSIONS as P } from "@/lib/constants";

// `icon` is a string key into NAV_ICONS (see ./icons.js). Each item declares the
// permission required to see it; groups with no visible child are hidden.
export const ADMIN_NAV = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: "dashboard", permission: null }],
  },
  {
    label: "Leads",
    items: [
      { label: "All Leads", href: "/admin/leads", icon: "users", permission: P.LEADS_VIEW },
      { label: "Available", href: "/admin/leads?status=available", icon: "users", permission: P.LEADS_VIEW },
      { label: "Sold", href: "/admin/leads?status=purchased", icon: "users", permission: P.LEADS_VIEW },
      { label: "Duplicates", href: "/admin/leads?status=duplicate", icon: "users", permission: P.LEADS_VIEW },
    ],
  },
  {
    label: "Sources",
    items: [
      { label: "Integrations", href: "/admin/sources", icon: "radio", permission: P.SETTINGS_MANAGE },
      { label: "Imports", href: "/admin/sources/imports", icon: "radio", permission: P.LEADS_MANAGE },
    ],
  },
  {
    label: "Buyers",
    items: [{ label: "All Buyers", href: "/admin/buyers", icon: "users", permission: P.BUYERS_VIEW }],
  },
  {
    label: "Sales",
    items: [
      { label: "Purchases", href: "/admin/sales/purchases", icon: "wallet", permission: P.SALES_VIEW },
      { label: "Transactions", href: "/admin/sales/transactions", icon: "wallet", permission: P.FINANCE_MANAGE },
      { label: "Refunds", href: "/admin/sales/refunds", icon: "wallet", permission: P.FINANCE_MANAGE },
      { label: "Invoices", href: "/admin/sales/invoices", icon: "wallet", permission: P.FINANCE_MANAGE },
    ],
  },
  {
    label: "Pricing",
    items: [
      { label: "Pricing Rules", href: "/admin/pricing", icon: "tags", permission: P.PRICING_MANAGE },
      { label: "Categories", href: "/admin/pricing/categories", icon: "tags", permission: P.PRICING_MANAGE },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: "chart", permission: P.ANALYTICS_VIEW },
      { label: "Audit Log", href: "/admin/audit", icon: "shield", permission: P.AUDIT_VIEW },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Users", href: "/admin/settings/users", icon: "settings", permission: P.USERS_MANAGE },
      { label: "System", href: "/admin/settings", icon: "settings", permission: P.SETTINGS_MANAGE },
    ],
  },
];

export function filterNav(nav, user) {
  return nav
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (it) => it.permission == null || user.permissions.includes(it.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);
}
