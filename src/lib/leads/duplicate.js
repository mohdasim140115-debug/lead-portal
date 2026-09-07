import Lead from "@/lib/db/models/Lead";

// Duplicate rules — v1 defaults. Phase 8 moves these into an admin-editable
// Setting; the shape stays the same.
export const DUPLICATE_RULES = {
  windowDays: 30,
  // "any" = same phone OR email; "phone" / "email" = that field only;
  // "phone_category" = same phone within the same category.
  match: "any",
};

/**
 * Find an existing lead that the given contact details duplicate.
 * @returns {Promise<import('mongoose').Document|null>}
 */
export async function findDuplicate({ phone, email, category }, rules = DUPLICATE_RULES) {
  if (!phone && !email) return null;

  const since = new Date(Date.now() - rules.windowDays * 86400_000);
  const base = {
    createdAt: { $gte: since },
    isDuplicate: false,
    archivedAt: null,
  };

  const or = [];
  if (rules.match === "any" || rules.match === "phone") {
    if (phone) or.push({ phone });
  }
  if (rules.match === "any" || rules.match === "email") {
    if (email) or.push({ email });
  }
  if (rules.match === "phone_category" && phone) {
    return Lead.findOne({ ...base, phone, category: category || null }).sort({ createdAt: -1 });
  }
  if (!or.length) return null;

  return Lead.findOne({ ...base, $or: or }).sort({ createdAt: -1 });
}
