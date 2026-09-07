# Lead Portal

Production-grade lead selling platform — capture leads from many sources, qualify
and price them, and distribute them to buyers with a wallet-backed marketplace.

**Stack:** Next.js 15 (App Router) · JavaScript · React 19 · MongoDB + Mongoose ·
Tailwind CSS · custom JWT auth (httpOnly cookie).

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill MONGODB_URI, AUTH_SECRET, SEED_ADMIN_*
npm run seed                   # creates the first Super Admin
npm run dev
```

Open http://localhost:3000 and sign in with the seeded credentials.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run seed` | Create/update the first Super Admin from `SEED_ADMIN_*` |
| `npm test` | Run the Node test suite (`tests/`) |

## Architecture

```
src/
  app/                 Routes (App Router)
    admin/             Staff console  (role-gated)
    buyer/             Buyer portal   (role-gated)
    login/             Auth entry
    api/               Route handlers
  components/
    ui/                Design-system primitives
    nav/               Sidebar / topbar / nav config
  lib/
    db/                Mongoose connection + models
    auth/              Password hashing, JWT, session, RBAC guards
    api/               Response envelope, error types, pagination
    services/          Business logic (audit, users, …)
    validation/        Zod schemas
    constants.js       Enums persisted in the DB
```

- **Auth:** email + password → bcrypt verify → signed JWT in an httpOnly cookie.
  `middleware.js` does a coarse redirect gate; every page and API route
  re-checks the session against the DB (status, `tokenVersion`) server-side.
- **RBAC:** roles map to coarse permissions in `lib/constants.js`; guards in
  `lib/auth/guards.js` enforce them in pages (`requirePermission`) and route
  handlers (`apiRequirePermission`).
- **API:** every handler is wrapped by `handler()` which normalises errors to
  `{ success, data, message, error }` and keeps internal details out of responses.
- **Audit:** important mutations call `recordAudit()`.

## Build phases

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md). Phase 1 (foundation:
DB, auth, RBAC, design system, user management, app shells) is complete.
