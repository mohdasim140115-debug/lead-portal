// Minimal RFC-4180-ish CSV parser (handles quoted fields, embedded commas,
// escaped quotes, \r\n). No dependency. Returns { headers, rows } where rows are
// arrays of strings.
export function parseCsv(text) {
  const src = text.replace(/^﻿/, ""); // strip BOM
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\r") continue;
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const nonEmpty = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (!nonEmpty.length) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map((h) => h.trim());
  return { headers, rows: nonEmpty.slice(1) };
}

// Canonical lead fields a CSV column can map to.
export const IMPORT_FIELDS = [
  "name", "phone", "email", "whatsapp",
  "city", "state", "country", "pincode",
  "category", "subcategory", "requirement", "budget",
  "utmSource", "utmMedium", "utmCampaign", "campaign",
];

// Best-effort auto-mapping from header text to a canonical field.
export function autoMap(headers) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const table = {
    name: ["name", "fullname", "leadname", "contactname"],
    phone: ["phone", "mobile", "phonenumber", "mobilenumber", "contact", "contactnumber", "number"],
    email: ["email", "emailaddress", "mail"],
    whatsapp: ["whatsapp", "whatsappnumber", "wa"],
    city: ["city", "town"],
    state: ["state", "region"],
    country: ["country"],
    pincode: ["pincode", "zip", "zipcode", "postalcode", "pin"],
    category: ["category", "service", "product", "interest"],
    subcategory: ["subcategory", "subservice"],
    requirement: ["requirement", "message", "notes", "comments", "query", "description"],
    budget: ["budget", "amount", "value"],
    utmSource: ["utmsource"],
    utmMedium: ["utmmedium"],
    utmCampaign: ["utmcampaign"],
    campaign: ["campaign", "campaignname", "adcampaign"],
  };
  const mapping = {};
  headers.forEach((h, idx) => {
    const n = norm(h);
    for (const [field, aliases] of Object.entries(table)) {
      if (aliases.includes(n)) { mapping[idx] = field; return; }
    }
  });
  return mapping;
}
