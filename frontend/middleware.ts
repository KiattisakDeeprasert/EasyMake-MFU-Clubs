import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getRoleFromRequest(req: NextRequest): "user" | "club-leader" | "co-leader" | "super-admin" | null {
  const cookieRole = req.cookies.get("role")?.value;
  if (cookieRole === "user" || cookieRole === "club-leader" || cookieRole === "co-leader" || cookieRole === "super-admin") {
    return cookieRole as any;
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = getRoleFromRequest(req);

  if (pathname === "/admin/login") {
    if (role === "club-leader" || role === "co-leader" || role === "super-admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // protect /admin/system/*
  if (pathname.startsWith("/admin/system")) {
    if (role !== "super-admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/not-authorized";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // protect /admin/my-club/*
  if (pathname.startsWith("/admin/my-club")) {
    if (role === "club-leader" || role === "co-leader" || role === "super-admin") {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/not-authorized";
    return NextResponse.redirect(url);
  }

  // protect generic /admin/*
  if (pathname.startsWith("/admin")) {
    if (role === "club-leader" || role === "co-leader" || role === "super-admin") {
      return NextResponse.next();
    }
    
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
