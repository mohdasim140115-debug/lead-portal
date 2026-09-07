import { handler, ok } from "@/lib/api/respond";
import { apiRequireStaff } from "@/lib/auth/guards";
import { listCategories } from "@/lib/services/categoryService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await apiRequireStaff();
  const cats = await listCategories();
  return ok(
    cats.map((c) => ({ name: c.name, slug: c.slug, parent: c.parent, leadCount: c.leadCount }))
  );
});
