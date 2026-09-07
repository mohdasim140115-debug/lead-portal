import Category from "@/lib/db/models/Category";
import { slugify, titleCase } from "@/lib/leads/normalize";

// Upsert a category (and optional parent) from a free-text name. Called on lead
// create / import so filter dropdowns stay in sync with real data.
export async function ensureCategory(name, parentName) {
  const clean = titleCase(name);
  if (!clean) return null;
  const slug = slugify(clean);
  if (!slug) return null;

  if (parentName) await ensureCategory(parentName, null);

  await Category.updateOne(
    { slug },
    {
      $setOnInsert: { name: clean, slug, parent: parentName ? titleCase(parentName) : null },
      $inc: { leadCount: 1 },
    },
    { upsert: true }
  );
  return clean;
}

export async function listCategories() {
  return Category.find({ active: true }).sort({ parent: 1, name: 1 }).lean();
}
