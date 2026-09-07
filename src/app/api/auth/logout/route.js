import { handler, ok } from "@/lib/api/respond";
import { destroySession } from "@/lib/auth/session";

export const runtime = "nodejs";

export const POST = handler(async () => {
  await destroySession();
  return ok({ redirect: "/login" });
});
