import { test } from "node:test";
import assert from "node:assert/strict";

process.env.AUTH_SECRET = process.env.AUTH_SECRET || "x".repeat(48);

const { normalizePhone, normalizeEmail, isValidPhone } = await import("../src/lib/leads/normalize.js");
const { scoreLead } = await import("../src/lib/leads/score.js");
const { parseCsv, autoMap } = await import("../src/lib/leads/csv.js");

test("phone normalisation", () => {
  assert.equal(normalizePhone("98765 43210"), "+919876543210");
  assert.equal(normalizePhone("098765-43210"), "+919876543210");
  assert.equal(normalizePhone("+1 (415) 555 2671"), "+14155552671");
  assert.equal(normalizePhone("919876543210"), "+919876543210");
  assert.equal(normalizePhone(""), null);
});

test("email normalisation", () => {
  assert.equal(normalizeEmail("  Foo@Bar.COM "), "foo@bar.com");
  assert.equal(normalizeEmail("not-an-email"), null);
});

test("score rises with completeness", () => {
  const bare = scoreLead({ phone: "+919876543210" });
  const full = scoreLead({
    phone: "+919876543210", email: "a@b.com", name: "Asha",
    requirement: "Need a modular kitchen for 2BHK", budget: 200000,
    city: "Delhi", category: "Interior Design",
  });
  assert.ok(full.score > bare.score);
  assert.equal(full.quality, "high");
});

test("CSV parser handles quotes and commas", () => {
  const { headers, rows } = parseCsv('name,note\n"Asha, R","said ""hi"""\nBob,plain\n');
  assert.deepEqual(headers, ["name", "note"]);
  assert.deepEqual(rows[0], ["Asha, R", 'said "hi"']);
  assert.deepEqual(rows[1], ["Bob", "plain"]);
});

test("autoMap recognises common headers", () => {
  const m = autoMap(["Full Name", "Mobile Number", "Email Address", "City"]);
  assert.equal(m[0], "name");
  assert.equal(m[1], "phone");
  assert.equal(m[2], "email");
  assert.equal(m[3], "city");
});

test("isValidPhone bounds", () => {
  assert.equal(isValidPhone("+919876543210"), true);
  assert.equal(isValidPhone("+12345"), false);
});
