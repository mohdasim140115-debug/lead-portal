import {
  LayoutDashboard, Users, Radio, Wallet, Tags, BarChart3, Settings, ShieldCheck,
} from "lucide-react";
import { PERMISSIONS as P } from "@/lib/constants";

// Each item declares the permission required to see it. Groups with no visible
// child are hidden entirely.
export const ADMIN_NAV = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: null },
    ],
  },
  {
    label: "Leads",
    items: [
      { label: "All Leads", href: "/admin/leads", icon: Users, permission: P.LEADS_VIEW },
      { label: "Available", href: "/admin/leads?status=available", icon: Users, permission: P.LEADS_VIEW },
      { label: "Sold", href: "/admin/leads?status=purchased", icon: Users, permission: P.LEADS_VIEW },
      { label: "Duplicates", href: "/admin/leads?status=duplicate", icon: Users, permission: P.LEADS_VIEW },
    ],
  },
  {
    label: "Sources",
    items: [
      { label: "Integrations", href: "/admin/sources", icon: Radio, permission: P.SETTINGS_MANAGE },
      { label: "Imports", href: "/admin/sources/imports", icon: Radio, permission: P.LEADS_MANAGE },
    ],
  },
  {
    label: "Buyers",
    items: [
      { label: "All Buyers", href: "/admin/buyers", icon: Users, permission: P.BUYERS_VIEW },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Purchases", href: "/admin/sales/purchases", icon: Wallet, permission: P.SALES_VIEW },
      { label: "Transactions", href: "/admin/sales/transactions", icon: Wallet, permission: P.FINANCE_MANAGE },
      { label: "Refunds", href: "/admin/sales/refunds", icon: Wallet, permission: P.FINANCE_MANAGE },
      { label: "Invoices", href: "/admin/sales/invoices", icon: Wallet, permission: P.FINANCE_MANAGE },
    ],
  },
  {
    label: "Pricing",
    items: [
      { label: "Pricing Rules", href: "/admin/pricing", icon: Tags, permission: P.PRICING_MANAGE },
      { label: "Categories", href: "/admin/pricing/categories", icon: Tags, permission: P.PRICING_MANAGE },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: P.ANALYTICS_VIEW },
      { label: "Audit Log", href: "/admin/audit", icon: ShieldCheck, permission: P.AUDIT_VIEW },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Users", href: "/admin/settings/users", icon: Settings, permission: P.USERS_MANAGE },
      { label: "System", href: "/admin/settings", icon: Settings, permission: P.SETTINGS_MANAGE },
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
