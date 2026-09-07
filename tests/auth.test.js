import { test } from "node:test";
import assert from "node:assert/strict";

process.env.AUTH_SECRET = process.env.AUTH_SECRET || "x".repeat(48);

const { signSession, verifySession } = await import("../src/lib/auth/jwt.js");
const { hashPassword, verifyPassword } = await import("../src/lib/auth/password.js");
const { rateLimit } = await import("../src/lib/rateLimit.js");
const { ROLE_PERMISSIONS, ROLES, PERMISSIONS } = await import("../src/lib/constants.js");

test("JWT round-trips and rejects tampering", async () => {
  const token = await signSession({ sub: "abc", role: "admin", tv: 0 });
  const payload = await verifySession(token);
  assert.equal(payload.sub, "abc");
  assert.equal(await verifySession(token + "x"), null);
  assert.equal(await verifySession(null), null);
});

test("password hashing verifies correctly", async () => {
  const hash = await hashPassword("correct horse battery");
  assert.equal(await verifyPassword("correct horse battery", hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
  assert.equal(await verifyPassword("x", null), false);
});

test("rate limiter blocks after the limit", () => {
  const key = `test:${Math.random()}`;
  for (let i = 0; i < 3; i++) assert.equal(rateLimit(key, { limit: 3 }).allowed, true);
  assert.equal(rateLimit(key, { limit: 3 }).allowed, false);
});

test("buyers hold no staff permissions; super admin holds all", () => {
  assert.deepEqual(ROLE_PERMISSIONS[ROLES.BUYER], []);
  assert.equal(
    ROLE_PERMISSIONS[ROLES.SUPER_ADMIN].length,
    Object.values(PERMISSIONS).length
  );
  assert.ok(!ROLE_PERMISSIONS[ROLES.FINANCE].includes(PERMISSIONS.LEADS_MANAGE));
});
