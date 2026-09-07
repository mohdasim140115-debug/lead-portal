// Validated environment access. Import from here instead of reading process.env directly.

function required(name) {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function optional(name, fallback = "") {
  const v = process.env[name];
  return v && v.trim() ? v : fallback;
}

export const env = {
  get mongodbUri() {
    return required("MONGODB_URI");
  },
  get authSecret() {
    const s = required("AUTH_SECRET");
    if (s.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters");
    return s;
  },
  authCookieName: optional("AUTH_COOKIE_NAME", "lp_session"),
  authSessionTtl: Number(optional("AUTH_SESSION_TTL", "604800")),
  appUrl: optional("APP_URL", "http://localhost:3000"),
  isProd: process.env.NODE_ENV === "production",

  razorpay: {
    keyId: optional("RAZORPAY_KEY_ID"),
    keySecret: optional("RAZORPAY_KEY_SECRET"),
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
  },
  meta: {
    appSecret: optional("META_APP_SECRET"),
    verifyToken: optional("META_VERIFY_TOKEN"),
    pageAccessToken: optional("META_PAGE_ACCESS_TOKEN"),
  },
  google: {
    leadWebhookKey: optional("GOOGLE_LEAD_WEBHOOK_KEY"),
  },
  leadIngestApiKeys: optional("LEAD_INGEST_API_KEYS")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean),
};
