// Usage: npm run seed
// Creates (or updates) the first Super Admin from SEED_ADMIN_* env vars.
import "dotenv/config";
import fs from "node:fs";
import mongoose from "mongoose";

// Load .env.local if present (Next-style), without overriding real env.
for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2]?.replace(/^["']|["']$/g, "") ?? "";
      }
    }
  }
}

const { connectDB } = await import("@/lib/db/mongoose.js");
const { default: User } = await import("@/lib/db/models/User.js");
const { hashPassword } = await import("@/lib/auth/password.js");
const { ROLES } = await import("@/lib/constants.js");

const email = (process.env.SEED_ADMIN_EMAIL || "").toLowerCase().trim();
const password = process.env.SEED_ADMIN_PASSWORD || "";
const name = process.env.SEED_ADMIN_NAME || "Super Admin";

if (!email || !password) {
  console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD first.");
  process.exit(1);
}
if (password.length < 10) {
  console.error("SEED_ADMIN_PASSWORD must be at least 10 characters.");
  process.exit(1);
}

await connectDB();

const passwordHash = await hashPassword(password);
const existing = await User.findOne({ email });

if (existing) {
  existing.name = name;
  existing.role = ROLES.SUPER_ADMIN;
  existing.status = "active";
  existing.passwordHash = passwordHash;
  existing.tokenVersion += 1;
  await existing.save();
  console.log(`Updated existing user ${email} as Super Admin.`);
} else {
  await User.create({ name, email, passwordHash, role: ROLES.SUPER_ADMIN, status: "active" });
  console.log(`Created Super Admin ${email}.`);
}

await mongoose.disconnect();
process.exit(0);
