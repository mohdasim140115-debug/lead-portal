// `icon` is a string key into NAV_ICONS (see ./icons.js).
export const BUYER_NAV = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/buyer", icon: "dashboard" }],
  },
  {
    label: "Leads",
    items: [
      { label: "Available Leads", href: "/buyer/leads", icon: "search" },
      { label: "My Leads", href: "/buyer/purchased", icon: "inbox" },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Wallet", href: "/buyer/wallet", icon: "wallet" },
      { label: "Invoices", href: "/buyer/invoices", icon: "receipt" },
    ],
  },
];
