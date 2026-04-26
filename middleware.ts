import { auth } from "@/lib/auth/edge-config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  // Protect admin routes — require admin role
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn || role !== "admin") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Protect participant submit routes — require any authenticated session with runnerId
  if (nextUrl.pathname.startsWith("/submit")) {
    if (!isLoggedIn || !session?.user?.runnerId) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/submit/:path*"],
};
