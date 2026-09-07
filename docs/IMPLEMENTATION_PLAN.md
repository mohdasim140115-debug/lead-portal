# Lead Portal — Implementation Plan

Built from an empty repository. Stack: Next.js 15 (App Router) · JavaScript ·
React 19 · MongoDB/Mongoose · Tailwind · custom JWT auth.

## Cross-cutting principles

- Server Components by default; Client Components only for interaction.
- Every route handler wrapped by `handler()` → uniform `{ success, data, message, error }`.
- Authorisation enforced server-side in every page (`requirePermission`) and API
  route (`apiRequirePermission`); `middleware.js` is a coarse gate only.
- All list endpoints: server-side pagination + indexed queries + projections.
- Important mutations write an `AuditLog` entry.
- Money never moves without a ledger `Transaction`; lead/wallet mutations use
  atomic Mongo operations / `findOneAndUpdate` guards to prevent races.

## Phase 1 — Foundation ✅ (complete)

- Next.js + Tailwind design system (`components/ui/*`), CSS-variable theme.
- Mongoose connection with hot-reload-safe cache.
- Models: `User`, `AuditLog`.
- Auth: bcrypt + `jose` JWT in an httpOnly cookie; DB-backed session check with
  `tokenVersion` invalidation; login rate limiting; `/api/auth/{login,logout,me}`.
- RBAC: 6 roles → coarse permission map; page + API guards.
- App shells: `/admin` (staff, permission-filtered sidebar) and `/buyer`.
- User management (list / create / edit / disable / password reset) — full flow.
- Seed script for the first Super Admin.
- SEO baseline (robots, sitemap, noindex on private surfaces), 404 / error UI.
- Unit tests: JWT, password, rate limit, RBAC.

## Phase 2 — Lead management ✅ (complete)

- Models: `Lead` (contact, embedded `attribution` sub-doc + `externalIds` map,
  embedded `statusHistory`, quality/score, pricing + selling model + buyer slots,
  duplicate linkage, unique-partial `dedupeKey` for idempotent ingestion),
  `Category` (auto-populated name registry).
- Indexes: `createdAt`, `{status,category,city,createdAt}`, `{source,createdAt}`,
  `{phone,createdAt}`, `{email,createdAt}`, unique-partial `dedupeKey`.
- `leadService`: `createLead` (normalise → score → duplicate-check → persist +
  audit + idempotency), `listLeads` (filters + whitelisted sort + projection +
  pagination + phone masking), `getLead`, `updateLeadStatus` (admin-settable set +
  history + sold-lock), `updateLeadFields` (re-scores), `archiveLead`.
- `duplicate.js` — configurable window/match (v1: 30d, phone OR email).
- `score.js` — weighted completeness + contactability → 0–100 + quality band.
- CSV: dependency-free RFC-4180 parser, header auto-map, `importService` dry-run
  preview + commit (duplicates flagged, not dropped).
- API: `/api/leads` GET+POST, `/api/leads/[id]` GET/PATCH/DELETE,
  `/api/leads/[id]/status` POST, `/api/leads/import` POST, `/api/categories` GET.
- Admin UI: `/admin/leads` (URL-synced filter bar + debounced search, server
  table, pagination, Add-lead modal); `/admin/leads/[id]` (full detail, PII
  masking by permission, status/edit/archive); `/admin/sources/imports` CSV
  wizard. Dashboard wired to real aggregation.
- RBAC: middleware route→permission gate (`lib/auth/routeAccess.js`); page/API
  guards remain source of truth; `error.js` re-throws `NEXT_*` errors.
- Tests: normalisation, scoring, CSV parse + auto-map.

## Phase 3 — Lead sources & ingestion

- Source adaptor interface: `normalize(payload) → canonical lead`.
- `POST /api/leads/ingest` — public, API-key auth, rate limited, honeypot,
  idempotency key, duplicate detection hook. For landing pages / websites.
- `duplicateService`: normalised phone/email, configurable window + scope
  (phone, email, phone+category…), admin-editable rules in `Setting`.
  Duplicates recorded, linked to the original, source preserved.
- Meta: `GET/POST /api/webhooks/meta` — verify token + `X-Hub-Signature-256`,
  fetch full lead via Graph API with server-side page token, idempotent on Meta
  lead id, store page/form/campaign/adset/ad.
- Google: `POST /api/webhooks/google` — shared-key auth, Lead Form payload
  mapping, idempotent on `lead_id`.
- `IntegrationConfig` model so tokens rotate without code changes.
- Admin: source integration screens, ingestion logs, webhook failure list.

## Phase 4 — Buyers, pricing & purchase

- Models: `Buyer` (company, contacts, categories, locations, limits, wallet ref,
  exclusive/shared eligibility, priority, status), `PricingRule`, `Purchase`.
- `pricingService`: resolve price from ordered rules
  (category / location / quality / source / exclusive / buyer / campaign).
- Buyer portal: dashboard, available leads (safe preview only — no PII),
  lead detail (full PII only after an owning `Purchase` exists), my leads with
  buyer-settable status.
- `purchaseService.purchase()` — atomic: re-check availability via
  `findOneAndUpdate` slot decrement, wallet debit + `Transaction`, `Purchase`
  doc, lead assignment, audit. Handles exclusive (1 slot) and shared (N slots)
  with no double-sell under concurrency.
- Admin: buyer CRUD, pricing rule editor.

## Phase 5 — Wallet & payments

- Models: `Wallet` (balance, currency), `Transaction` (credit/debit/refund/
  adjustment, reason, balanceAfter, refs), `Payment`, `Invoice`.
- `walletService`: `credit` / `debit` / `refund` / `adjust` — every call writes a
  `Transaction`; balance mutated only through these.
- Razorpay: `POST /api/payments/order`, client checkout, `POST /api/payments/verify`
  (signature), `POST /api/webhooks/razorpay` (idempotent on `payment_id`,
  authoritative wallet credit). Never credit on the client response alone.
- Invoices: unique sequential numbers (`InvoiceCounter`), PDF-ready data.
- Buyer wallet page (balance, ledger, recharge), admin transactions / invoices.

## Phase 6 — Distribution engine

- `distributionService` with pluggable strategies: manual, round-robin,
  priority, auto-sell. Matching: category, subcategory, city/state, buyer
  eligibility + status + wallet + daily/monthly limits + price ceiling +
  exclusive/shared rules + priority.
- `DistributionRule` model; runs on lead `available` transition (queue/cron-ready).
- Admin: rule builder, dry-run preview, distribution log.

## Phase 7 — Analytics & reporting

- Aggregation-pipeline services (no large client payloads): leads over time,
  revenue over time, by source / category, conversion funnel, buyer performance.
- Admin dashboard wired to real metrics; report pages with date ranges + export.
- Cache heavy aggregates (short TTL) where safe.

## Phase 8 — Production hardening

- Refund flow (request → review → approve → wallet credit → audit), duplicate
  refund prevention.
- Notifications: provider-agnostic `notificationService` (in-app now; email/SMS/
  WhatsApp adaptors later), event bus for lead/payment/wallet events.
- Security pass: input sanitisation, rate-limit coverage, cookie flags,
  webhook signature coverage, dependency audit.
- Performance pass: index review against real query patterns, N+1 checks,
  bundle analysis, image optimisation.
- Accessibility + SEO pass on public pages; structured data.
- Expand test suite: ingestion, duplicate detection, wallet, purchase
  (incl. concurrent exclusive/shared), refund.

## Future-ready (not built now, not blocked)

Multi-tenant (`org` scoping on every model), buyer API keys, subscription plans,
AI scoring hook (`scoreService` is already an interface), call tracking,
external lead providers (adaptor pattern already in place).
