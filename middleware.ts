import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up", "/submit", "/api/auth"];

// Check if a route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/api/auth") {
      return pathname.startsWith(route);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("better-auth.session_token");

  if (!sessionToken) {
    // Redirect to sign-in if no session token
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Session token exists, continue
  // Note: We're doing a simple presence check here to avoid Edge Runtime issues
  // The actual session validation will happen on the server side
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
