import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Lead from "@/lib/db/models/Lead";
import { ApiError } from "@/lib/api/errors";
import {
  LEAD_STATUS, LEAD_SOURCES, ADMIN_SETTABLE_STATUS,
} from "@/lib/constants";
import { normalizePhone, normalizeEmail, titleCase } from "@/lib/leads/normalize";
import { scoreLead } from "@/lib/leads/score";
import { findDuplicate } from "@/lib/leads/duplicate";
import { ensureCategory } from "@/lib/services/categoryService";
import { recordAudit } from "@/lib/services/auditService";

// ---- helpers ----

function buildContact(input) {
  const phone = normalizePhone(input.phone);
  return {
    name: input.name ? titleCase(input.name) : undefined,
    phone: phone || undefined,
    phoneRaw: input.phone || undefined,
    email: normalizeEmail(input.email) || undefined,
    whatsapp: normalizePhone(input.whatsapp) || phone || undefined,
    city: input.city ? titleCase(input.city) : undefined,
    state: input.state ? titleCase(input.state) : undefined,
    country: input.country ? titleCase(input.country) : "India",
    pincode: input.pincode || undefined,
    category: input.category ? titleCase(input.category) : undefined,
    subcategory: input.subcategory ? titleCase(input.subcategory) : undefined,
    requirement: input.requirement || undefined,
    budget: input.budget != null && input.budget !== "" ? Number(input.budget) : undefined,
  };
}

/**
 * Create one lead with normalisation, scoring and duplicate detection.
 * Used by manual entry, CSV import and (later) ingestion adaptors.
 */
export async function createLead(input, { actor, source, dedupeKey, attribution, ip } = {}) {
  await connectDB();
  const contact = buildContact(input);

  if (!contact.phone && !contact.email) {
    throw new ApiError(422, "A phone number or email is required");
  }

  // Idempotency: same dedupeKey → return the existing lead untouched.
  if (dedupeKey) {
    const existing = await Lead.findOne({ dedupeKey });
    if (existing) return { lead: existing, duplicate: false, idempotentHit: true };
  }

  const { score, quality } = scoreLead(contact);
  const dup = await findDuplicate(contact);

  const status = dup ? LEAD_STATUS.DUPLICATE : LEAD_STATUS.NEW;
  const doc = await Lead.create({
    ...contact,
    source: source || LEAD_SOURCES.MANUAL,
    attribution: attribution || {},
    ip,
    dedupeKey: dedupeKey || undefined,
    score,
    quality,
    status,
    isDuplicate: !!dup,
    duplicateOf: dup?._id || null,
    createdBy: actor?.id || null,
    statusHistory: [
      { to: status, by: actor?.id || null, byLabel: actor ? undefined : "system", note: dup ? "Auto-flagged as duplicate" : "Lead created" },
    ],
  });

  if (contact.category) await ensureCategory(contact.category, contact.subcategory ? null : undefined);

  await recordAudit({
    actor,
    action: "lead.create",
    entityType: "Lead",
    entityId: doc._id,
    after: { source: doc.source, status: doc.status, phone: doc.phone, email: doc.email },
    metadata: { duplicate: !!dup },
  });

  return { lead: doc, duplicate: !!dup };
}

// ---- listing ----

const SORTABLE = new Set(["createdAt", "score", "price", "status"]);

export async function listLeads(params = {}) {
  await connectDB();
  const {
    page = 1, pageSize = 25, q, status, source, category, quality,
    city, from, to, includeArchived = false,
    sort = "createdAt", dir = "desc",
  } = params;

  const filter = {};
  if (!includeArchived) filter.archivedAt = null;
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (category) filter.category = category;
  if (quality) filter.quality = quality;
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}`, "i");
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = endOfDay(to);
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { requirement: rx }];
  }

  const sortField = SORTABLE.has(sort) ? sort : "createdAt";
  const sortSpec = { [sortField]: dir === "asc" ? 1 : -1 };
  const skip = (page - 1) * pageSize;

  const projection =
    "name phone email city state category subcategory source status quality score price sellingModel buyerCount maxBuyers isDuplicate createdAt";

  const [items, total] = await Promise.all([
    Lead.find(filter).select(projection).sort(sortSpec).skip(skip).limit(pageSize).lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeRow),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLead(id) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "Lead not found");
  const lead = await Lead.findById(id)
    .populate("duplicateOf", "name phone status createdAt")
    .populate("createdBy", "name email")
    .populate("statusHistory.by", "name email")
    .lean();
  if (!lead || lead.archivedAt) throw new ApiError(404, "Lead not found");
  return serializeDetail(lead);
}

// ---- mutations ----

export async function updateLeadStatus(id, nextStatus, { actor, note } = {}) {
  await connectDB();
  if (!ADMIN_SETTABLE_STATUS.includes(nextStatus)) {
    throw new ApiError(422, "That status can't be set manually");
  }
  const lead = await Lead.findById(id);
  if (!lead || lead.archivedAt) throw new ApiError(404, "Lead not found");
  if ([LEAD_STATUS.PURCHASED, LEAD_STATUS.ASSIGNED].includes(lead.status)) {
    throw new ApiError(409, "This lead is already sold or assigned");
  }

  const from = lead.status;
  if (from === nextStatus) return serializeDetail(lead.toObject());

  lead.status = nextStatus;
  lead.statusHistory.push({ from, to: nextStatus, by: actor?.id || null, note });
  if (nextStatus === LEAD_STATUS.DUPLICATE) lead.isDuplicate = true;
  await lead.save();

  await recordAudit({
    actor, action: "lead.status", entityType: "Lead", entityId: lead._id,
    before: { status: from }, after: { status: nextStatus }, metadata: { note },
  });
  return serializeDetail(lead.toObject());
}

export async function updateLeadFields(id, fields, { actor } = {}) {
  await connectDB();
  const lead = await Lead.findById(id);
  if (!lead || lead.archivedAt) throw new ApiError(404, "Lead not found");

  const editable = [
    "name", "email", "whatsapp", "city", "state", "country", "pincode",
    "category", "subcategory", "requirement", "budget", "price",
  ];
  const before = {};
  const after = {};
  for (const key of editable) {
    if (fields[key] === undefined) continue;
    let val = fields[key];
    if (["name", "city", "state", "country", "category", "subcategory"].includes(key) && val) {
      val = titleCase(val);
    }
    if (key === "email") val = normalizeEmail(val) || null;
    if (key === "whatsapp") val = normalizePhone(val) || null;
    if (["budget", "price"].includes(key)) val = val === "" || val == null ? null : Number(val);
    before[key] = lead[key];
    after[key] = val;
    lead[key] = val;
  }

  // Re-score on content change.
  const { score, quality } = scoreLead(lead);
  lead.score = score;
  lead.quality = quality;
  await lead.save();
  if (lead.category) await ensureCategory(lead.category);

  await recordAudit({
    actor, action: "lead.update", entityType: "Lead", entityId: lead._id, before, after,
  });
  return serializeDetail(lead.toObject());
}

export async function archiveLead(id, { actor } = {}) {
  await connectDB();
  const lead = await Lead.findById(id);
  if (!lead || lead.archivedAt) throw new ApiError(404, "Lead not found");
  if ([LEAD_STATUS.PURCHASED, LEAD_STATUS.ASSIGNED].includes(lead.status)) {
    throw new ApiError(409, "A sold or assigned lead can't be archived");
  }
  lead.archivedAt = new Date();
  await lead.save();
  await recordAudit({ actor, action: "lead.archive", entityType: "Lead", entityId: lead._id });
  return { ok: true };
}

// ---- serialisers ----

function serializeRow(l) {
  return {
    id: l._id.toString(),
    name: l.name || null,
    phoneMasked: maskPhone(l.phone),
    email: l.email || null,
    city: l.city || null,
    state: l.state || null,
    category: l.category || null,
    subcategory: l.subcategory || null,
    source: l.source,
    status: l.status,
    quality: l.quality,
    score: l.score,
    price: l.price,
    sellingModel: l.sellingModel,
    slots: `${l.buyerCount}/${l.maxBuyers}`,
    isDuplicate: l.isDuplicate,
    createdAt: l.createdAt,
  };
}

function serializeDetail(l) {
  return {
    id: l._id.toString(),
    name: l.name || null,
    phone: l.phone || null,
    phoneRaw: l.phoneRaw || null,
    email: l.email || null,
    whatsapp: l.whatsapp || null,
    city: l.city || null,
    state: l.state || null,
    country: l.country || null,
    pincode: l.pincode || null,
    category: l.category || null,
    subcategory: l.subcategory || null,
    requirement: l.requirement || null,
    budget: l.budget ?? null,
    source: l.source,
    attribution: l.attribution || {},
    ip: l.ip || null,
    status: l.status,
    verificationStatus: l.verificationStatus,
    quality: l.quality,
    score: l.score,
    price: l.price ?? null,
    sellingModel: l.sellingModel,
    maxBuyers: l.maxBuyers,
    buyerCount: l.buyerCount,
    isDuplicate: l.isDuplicate,
    duplicateOf: l.duplicateOf
      ? {
          id: l.duplicateOf._id.toString(),
          name: l.duplicateOf.name || null,
          status: l.duplicateOf.status,
          createdAt: l.duplicateOf.createdAt,
        }
      : null,
    createdBy: l.createdBy ? { name: l.createdBy.name, email: l.createdBy.email } : null,
    statusHistory: (l.statusHistory || []).map((h) => ({
      from: h.from || null,
      to: h.to,
      note: h.note || null,
      byLabel: h.byLabel || (h.by ? undefined : "system"),
      by: h.by && h.by.name ? { name: h.by.name, email: h.by.email } : null,
      at: h.at,
    })),
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

function maskPhone(p) {
  if (!p) return null;
  return p.length <= 4 ? p : `${p.slice(0, 3)}••••${p.slice(-3)}`;
}
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
