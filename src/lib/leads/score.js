import { LEAD_QUALITY } from "@/lib/constants";
import { isValidEmail, isValidPhone } from "@/lib/leads/normalize";

// v1 scoring: field completeness + contactability. The weights live here so the
// model can be swapped for a learned one later without changing call sites.
const WEIGHTS = {
  validPhone: 30,
  validEmail: 15,
  hasName: 10,
  hasRequirement: 15,
  hasBudget: 10,
  hasCity: 10,
  hasCategory: 10,
};

export function scoreLead(lead) {
  let score = 0;
  if (isValidPhone(lead.phone)) score += WEIGHTS.validPhone;
  if (isValidEmail(lead.email)) score += WEIGHTS.validEmail;
  if (lead.name && lead.name.trim().length > 1) score += WEIGHTS.hasName;
  if (lead.requirement && lead.requirement.trim().length > 10) score += WEIGHTS.hasRequirement;
  if (typeof lead.budget === "number" && lead.budget > 0) score += WEIGHTS.hasBudget;
  if (lead.city) score += WEIGHTS.hasCity;
  if (lead.category) score += WEIGHTS.hasCategory;

  score = Math.max(0, Math.min(100, score));
  const quality =
    score >= 70 ? LEAD_QUALITY.HIGH : score >= 40 ? LEAD_QUALITY.MEDIUM : LEAD_QUALITY.LOW;
  return { score, quality };
}
