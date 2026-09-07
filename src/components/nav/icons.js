"use client";

import {
  LayoutDashboard, Users, Radio, Wallet, Tags, BarChart3, Settings, ShieldCheck,
  Search, Inbox, Receipt,
} from "lucide-react";

// String-keyed icon registry so nav config (imported by Server Components) stays
// serialisable — component references never cross the RSC boundary.
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  users: Users,
  radio: Radio,
  wallet: Wallet,
  tags: Tags,
  chart: BarChart3,
  settings: Settings,
  shield: ShieldCheck,
  search: Search,
  inbox: Inbox,
  receipt: Receipt,
};
