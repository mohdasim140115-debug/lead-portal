import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/jwt";
import { env } from "@/lib/env";
import { STAFF_ROLES, ROLES } from "@/lib/constants";

// Coarse gate only. Authoritative auth + permission checks run server-side in
// pages and route handlers (they also verify DB state / tokenVersion).
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(env.authCookieName)?.value;
  const session = await verifySession(token);

  const isAdmin = pathname.startsWith("/admin");
  const isBuyer = pathname.startsWith("/buyer");
  const isLogin = pathname === "/login";

  if ((isAdmin || isBuyer) && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session) {
    const role = session.role;
    const isStaff = STAFF_ROLES.includes(role);
    if (isAdmin && !isStaff) {
      return NextResponse.redirect(new URL("/buyer", req.url));
    }
    if (isBuyer && role !== ROLES.BUYER) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (isLogin) {
      return NextResponse.redirect(new URL(isStaff ? "/admin" : "/buyer", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/buyer/:path*", "/login"],
};
