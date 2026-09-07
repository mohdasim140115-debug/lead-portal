// Normalisation helpers. Deliberately conservative — India-first but tolerant of
// other formats. Returns null when a value can't be sensibly normalised.

const DIGITS = /\D+/g;

/**
 * Normalise a phone number to "+<countrycode><number>" where possible.
 * - strips spaces / dashes / brackets
 * - 10-digit input is assumed Indian (+91)
 * - leading 0 on an 11-digit Indian number is dropped
 */
export function normalizePhone(input, defaultCountry = "91") {
  if (!input) return null;
  let s = String(input).trim();
  const hadPlus = s.startsWith("+");
  s = s.replace(DIGITS, "");
  if (!s) return null;

  if (hadPlus) return "+" + s;
  if (s.length === 10) return `+${defaultCountry}${s}`;
  if (s.length === 11 && s.startsWith("0")) return `+${defaultCountry}${s.slice(1)}`;
  if (s.length === 12 && s.startsWith(defaultCountry)) return `+${s}`;
  if (s.length > 12) return `+${s}`;
  // Fallback: assume it already carries a country code.
  return `+${s}`;
}

export function normalizeEmail(input) {
  if (!input) return null;
  const s = String(input).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

export function isValidEmail(s) {
  return !!normalizeEmail(s);
}

// A normalised phone with 10–15 digits is considered structurally valid.
export function isValidPhone(normalized) {
  if (!normalized) return false;
  const digits = normalized.replace(DIGITS, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function titleCase(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
