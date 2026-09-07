import { LayoutDashboard, Search, Inbox, Wallet, Receipt } from "lucide-react";

export const BUYER_NAV = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/buyer", icon: LayoutDashboard }],
  },
  {
    label: "Leads",
    items: [
      { label: "Available Leads", href: "/buyer/leads", icon: Search },
      { label: "My Leads", href: "/buyer/purchased", icon: Inbox },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Wallet", href: "/buyer/wallet", icon: Wallet },
      { label: "Invoices", href: "/buyer/invoices", icon: Receipt },
    ],
  },
];
