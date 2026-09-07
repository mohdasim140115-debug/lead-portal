import { handler, ok } from "@/lib/api/respond";
import { apiRequireUser } from "@/lib/auth/guards";

export const runtime = "nodejs";

export const GET = handler(async () => {
  const user = await apiRequireUser();
  return ok({ user });
});
