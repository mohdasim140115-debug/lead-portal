import mongoose from "mongoose";
import {
  LEAD_SOURCES, LEAD_STATUS, VERIFICATION_STATUS, LEAD_QUALITY, SELLING_MODEL,
} from "@/lib/constants";

const { Schema } = mongoose;

// Marketing attribution — kept in a sub-document so new channels/fields can be
// added later without touching the top-level schema.
const AttributionSchema = new Schema(
  {
    campaign: String,
    adSet: String,
    ad: String,
    form: String,
    landingPage: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    utmTerm: String,
    referrer: String,
    // Provider-native identifiers (Meta lead id, Google lead id, page/form ids…).
    externalIds: { type: Map, of: String },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    from: String,
    to: { type: String, required: true },
    by: { type: Schema.Types.ObjectId, ref: "User" },
    byLabel: String, // e.g. "system", "meta-webhook"
    note: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeadSchema = new Schema(
  {
    // ---- Contact (PII — gated from buyers before purchase) ----
    name: { type: String, trim: true, maxlength: 160 },
    phone: { type: String, trim: true },        // normalised, digits + optional +
    phoneRaw: { type: String, trim: true },      // as received
    email: { type: String, trim: true, lowercase: true },
    whatsapp: { type: String, trim: true },

    // ---- Location ----
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true, index: true },
    country: { type: String, trim: true, default: "India" },
    pincode: { type: String, trim: true },

    // ---- Classification ----
    category: { type: String, trim: true, index: true },
    subcategory: { type: String, trim: true },
    requirement: { type: String, trim: true, maxlength: 4000 },
    budget: { type: Number, min: 0 },

    // ---- Source & attribution ----
    source: { type: String, enum: Object.values(LEAD_SOURCES), required: true, index: true },
    attribution: { type: AttributionSchema, default: () => ({}) },
    ip: String,

    // ---- Lifecycle ----
    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.NEW,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.UNVERIFIED,
    },
    quality: { type: String, enum: Object.values(LEAD_QUALITY), default: LEAD_QUALITY.MEDIUM },
    score: { type: Number, min: 0, max: 100, default: 0 },
    statusHistory: { type: [StatusHistorySchema], default: [] },

    // ---- Pricing & selling (pricing engine fills these in Phase 4) ----
    price: { type: Number, min: 0, default: null },
    sellingModel: {
      type: String,
      enum: Object.values(SELLING_MODEL),
      default: SELLING_MODEL.EXCLUSIVE,
    },
    maxBuyers: { type: Number, min: 1, default: 1 },
    buyerCount: { type: Number, min: 0, default: 0 },

    // ---- Duplicate linkage ----
    isDuplicate: { type: Boolean, default: false, index: true },
    duplicateOf: { type: Schema.Types.ObjectId, ref: "Lead", default: null },

    // ---- Idempotency for webhook / API ingestion ----
    dedupeKey: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Query patterns: filtered lists sorted by recency; buyer marketplace matching.
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ status: 1, category: 1, city: 1, createdAt: -1 });
LeadSchema.index({ source: 1, createdAt: -1 });
LeadSchema.index({ phone: 1, createdAt: -1 });
LeadSchema.index({ email: 1, createdAt: -1 });
// Idempotent ingestion — only enforced when a key is present.
LeadSchema.index(
  { dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
