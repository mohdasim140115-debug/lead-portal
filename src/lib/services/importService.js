import { connectDB } from "@/lib/db/mongoose";
import { ApiError } from "@/lib/api/errors";
import { LEAD_SOURCES } from "@/lib/constants";
import { parseCsv } from "@/lib/leads/csv";
import { normalizePhone, normalizeEmail } from "@/lib/leads/normalize";
import { findDuplicate } from "@/lib/leads/duplicate";
import { createLead } from "@/lib/services/leadService";
import { recordAudit } from "@/lib/services/auditService";

const MAX_ROWS = 5000;

function rowToInput(cells, mapping) {
  const input = {};
  for (const [idx, field] of Object.entries(mapping)) {
    const v = (cells[idx] ?? "").trim();
    if (v) input[field] = v;
  }
  return input;
}

function splitAttribution(input) {
  const attribution = {};
  for (const k of ["utmSource", "utmMedium", "utmCampaign", "campaign"]) {
    if (input[k]) { attribution[k] = input[k]; delete input[k]; }
  }
  return attribution;
}

/**
 * Validate a CSV against a column mapping without writing anything.
 * @returns summary + per-row preview (first 100 rows)
 */
export async function dryRunImport({ csvText, mapping }) {
  await connectDB();
  const { headers, rows } = parseCsv(csvText);
  if (!headers.length) throw new ApiError(422, "The file has no readable header row");
  if (rows.length > MAX_ROWS) {
    throw new ApiError(422, `Too many rows (${rows.length}). Split the file into batches of ${MAX_ROWS}.`);
  }
  const mapped = Object.values(mapping);
  if (!mapped.includes("phone") && !mapped.includes("email")) {
    throw new ApiError(422, "Map at least a phone or email column");
  }

  let valid = 0;
  let invalid = 0;
  let duplicates = 0;
  const preview = [];

  for (let i = 0; i < rows.length; i++) {
    const input = rowToInput(rows[i], mapping);
    const phone = normalizePhone(input.phone);
    const email = normalizeEmail(input.email);
    const issues = [];
    if (!phone && !email) issues.push("no phone or email");

    let isDup = false;
    if (!issues.length) {
      const dup = await findDuplicate({ phone, email, category: input.category });
      isDup = !!dup;
    }

    if (issues.length) invalid++;
    else if (isDup) { duplicates++; valid++; }
    else valid++;

    if (preview.length < 100) {
      preview.push({
        row: i + 2, // +1 header, +1 to 1-index
        name: input.name || null,
        phone: phone || input.phone || null,
        email: email || null,
        city: input.city || null,
        category: input.category || null,
        duplicate: isDup,
        issues,
      });
    }
  }

  return {
    totalRows: rows.length,
    valid,
    invalid,
    duplicates,
    headers,
    preview,
  };
}

/**
 * Commit an import. Rows with no phone/email are skipped. Duplicates are still
 * created (leadService flags them) so nothing is silently lost.
 */
export async function commitImport({ csvText, mapping }, { actor } = {}) {
  await connectDB();
  const { headers, rows } = parseCsv(csvText);
  if (!headers.length) throw new ApiError(422, "The file has no readable header row");
  if (rows.length > MAX_ROWS) throw new ApiError(422, `Too many rows (max ${MAX_ROWS})`);

  const batchId = `csv_${Date.now()}`;
  let created = 0;
  let skipped = 0;
  let duplicates = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const input = rowToInput(rows[i], mapping);
    if (!normalizePhone(input.phone) && !normalizeEmail(input.email)) {
      skipped++;
      continue;
    }
    const attribution = splitAttribution(input);
    attribution.externalIds = { importBatch: batchId };
    try {
      const { duplicate } = await createLead(input, {
        actor,
        source: LEAD_SOURCES.CSV,
        attribution,
      });
      created++;
      if (duplicate) duplicates++;
    } catch (err) {
      errors.push({ row: i + 2, message: err.message });
      if (errors.length > 50) break;
    }
  }

  await recordAudit({
    actor,
    action: "lead.import",
    entityType: "Lead",
    metadata: { batchId, created, skipped, duplicates, errors: errors.length },
  });

  return { batchId, total: rows.length, created, skipped, duplicates, errors };
}
