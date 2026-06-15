import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware — refreshes the Supabase session on every request and
 * protects authenticated routes. Unauthenticated requests to
 * /dashboard, /onboarding, or /settings get redirected to /login.
 */

// Routes that don't require authentication.
const PUBLIC_ROUTES = new Set(["/", "/login", "/auth/callback"]);

// Prefixes that DO require authentication.
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/calendar", "/brand", "/settings"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  let response = NextResponse.next({ request });

  // Always create a server client so we can refresh the session cookie
  // (if any) before deciding what to do with the request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookie updates onto both the incoming request (so
          // downstream code sees the fresh values) and the outgoing
          // response (so the browser persists them).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the user — this triggers a session refresh if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes are always allowed through.
  if (PUBLIC_ROUTES.has(pathname)) {
    return response;
  }

  // Protected routes: bounce to /login (preserving the intended destination).
  if (isProtectedPath(pathname)) {
    if (!user) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Everything else: pass through (e.g. /api routes, static assets — but
  // Next already filters those before middleware runs).
  return response;
}

/**
 * Skip middleware for static assets, image optimizer, and the favicon.
 * This keeps the auth check fast and avoids touching requests that
 * can't carry cookies anyway.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
