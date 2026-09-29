import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

function loginRedirect(request: NextRequest) {
  const target = request.nextUrl.clone();
  target.pathname = "/acesso-7k2q";
  target.search = "";
  target.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(target);
}

export async function proxy(request: NextRequest) {
  const isAdmin = request.nextUrl.pathname.startsWith("/gestao-7k2q");
  const valid = await verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    process.env.ADMIN_SESSION_SECRET,
  );
  if (isAdmin && !valid) return loginRedirect(request);
  if (request.nextUrl.pathname === "/acesso-7k2q" && valid)
    return NextResponse.redirect(new URL("/gestao-7k2q", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/gestao-7k2q/:path*", "/acesso-7k2q"] };
