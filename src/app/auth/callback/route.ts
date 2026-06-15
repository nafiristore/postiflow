import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback route — handles the PKCE OAuth flow.
 * Supabase redirects here with `?code=...` after a sign-in (Google, magic link, etc.).
 * We exchange the code for a session, then redirect the user to either
 * /onboarding (new users without a brand yet) or /dashboard (returning users).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // If "next" is provided, use it as the post-login destination.
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful exchange — figure out where to send the user.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let destination = next;
      if (user) {
        const { data: brandRow } = await supabase
          .from("brands")
          .select("id")
          .eq("owner_user_id", user.id)
          .limit(1)
          .maybeSingle();

        // No brand yet = new user → onboarding. Otherwise → dashboard (or `next`).
        destination = brandRow ? next : "/onboarding";
      }

      return NextResponse.redirect(`${origin}${destination}`);
    }

    // Auth code exchange failed — bounce back to login with an error flag.
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // No code present — nothing to do, send to login.
  return NextResponse.redirect(`${origin}/login`);
}
