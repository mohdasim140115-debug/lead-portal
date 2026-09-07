// Central enums / constants. Keep values stable — they are persisted in the DB.

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SALES_MANAGER: "sales_manager",
  LEAD_MANAGER: "lead_manager",
  FINANCE: "finance",
  BUYER: "buyer",
};

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  sales_manager: "Sales Manager",
  lead_manager: "Lead Manager",
  finance: "Finance",
  buyer: "Buyer",
};

// Every non-buyer role is "staff" and may reach the admin surface.
export const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.SALES_MANAGER,
  ROLES.LEAD_MANAGER,
  ROLES.FINANCE,
];

export const ALL_ROLES = [...STAFF_ROLES, ROLES.BUYER];

// Coarse-grained permissions checked server-side. Mapped per role below.
export const PERMISSIONS = {
  LEADS_VIEW: "leads:view",
  LEADS_MANAGE: "leads:manage",
  LEADS_VIEW_PII: "leads:view_pii",
  BUYERS_VIEW: "buyers:view",
  BUYERS_MANAGE: "buyers:manage",
  PRICING_MANAGE: "pricing:manage",
  SALES_VIEW: "sales:view",
  FINANCE_MANAGE: "finance:manage",
  ANALYTICS_VIEW: "analytics:view",
  SETTINGS_MANAGE: "settings:manage",
  USERS_MANAGE: "users:manage",
  AUDIT_VIEW: "audit:view",
};

const P = PERMISSIONS;

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(P),
  [ROLES.ADMIN]: [
    P.LEADS_VIEW, P.LEADS_MANAGE, P.LEADS_VIEW_PII,
    P.BUYERS_VIEW, P.BUYERS_MANAGE, P.PRICING_MANAGE,
    P.SALES_VIEW, P.FINANCE_MANAGE, P.ANALYTICS_VIEW,
    P.SETTINGS_MANAGE, P.AUDIT_VIEW,
  ],
  [ROLES.SALES_MANAGER]: [
    P.LEADS_VIEW, P.LEADS_MANAGE, P.LEADS_VIEW_PII,
    P.BUYERS_VIEW, P.BUYERS_MANAGE, P.SALES_VIEW, P.ANALYTICS_VIEW,
  ],
  [ROLES.LEAD_MANAGER]: [
    P.LEADS_VIEW, P.LEADS_MANAGE, P.LEADS_VIEW_PII,
    P.PRICING_MANAGE, P.ANALYTICS_VIEW,
  ],
  [ROLES.FINANCE]: [
    P.SALES_VIEW, P.FINANCE_MANAGE, P.BUYERS_VIEW,
    P.ANALYTICS_VIEW, P.AUDIT_VIEW,
  ],
  [ROLES.BUYER]: [],
};

export const LEAD_SOURCES = {
  META: "meta",
  GOOGLE: "google",
  LANDING_PAGE: "landing_page",
  WEBSITE: "website",
  MANUAL: "manual",
  CSV: "csv",
  API: "api",
};

export const LEAD_STATUS = {
  NEW: "new",
  VERIFIED: "verified",
  AVAILABLE: "available",
  ASSIGNED: "assigned",
  PURCHASED: "purchased",
  CONTACTED: "contacted",
  FOLLOW_UP: "follow_up",
  INTERESTED: "interested",
  CONVERTED: "converted",
  NOT_INTERESTED: "not_interested",
  WRONG_NUMBER: "wrong_number",
  DUPLICATE: "duplicate",
  REJECTED: "rejected",
  REFUNDED: "refunded",
  CLOSED: "closed",
};

// Statuses a buyer is allowed to set on a lead they own.
export const BUYER_SETTABLE_STATUS = [
  LEAD_STATUS.CONTACTED,
  LEAD_STATUS.FOLLOW_UP,
  LEAD_STATUS.INTERESTED,
  LEAD_STATUS.CONVERTED,
  LEAD_STATUS.NOT_INTERESTED,
  LEAD_STATUS.WRONG_NUMBER,
  LEAD_STATUS.CLOSED,
];

export const VERIFICATION_STATUS = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  FAILED: "failed",
};

export const LEAD_QUALITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const SELLING_MODEL = {
  EXCLUSIVE: "exclusive",
  SHARED: "shared",
};

export const TXN_TYPE = {
  CREDIT: "credit",
  DEBIT: "debit",
  REFUND: "refund",
  ADJUSTMENT: "adjustment",
};

export const TXN_REASON = {
  RECHARGE: "recharge",
  LEAD_PURCHASE: "lead_purchase",
  REFUND: "refund",
  MANUAL_ADJUSTMENT: "manual_adjustment",
};

export const PAYMENT_STATUS = {
  CREATED: "created",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PURCHASE_STATUS = {
  ACTIVE: "active",
  REFUND_REQUESTED: "refund_requested",
  REFUNDED: "refunded",
};

export const DISTRIBUTION_STRATEGY = {
  MANUAL: "manual",
  ROUND_ROBIN: "round_robin",
  PRIORITY: "priority",
  AUTO_SELL: "auto_sell",
};

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
