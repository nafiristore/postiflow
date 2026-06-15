"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "idle" | "google" | "magic";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Memuat…</div>}>
      <LoginPageInner />
    </React.Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [mode, setMode] = React.useState<Mode>("idle");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(
    callbackError ? decodeURIComponent(callbackError) : null,
  );
  const [magicLinkSent, setMagicLinkSent] = React.useState(false);

  const supabase = React.useMemo(() => createClient(), []);

  /**
   * Resolve where to send the user after they land.
   * - Existing user with a brand → /dashboard
   * - New user (no brand yet) → /onboarding
   */
  const resolvePostLoginDestination = React.useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "/onboarding";

    const { data: brandRow } = await supabase
      .from("brands")
      .select("id")
      .eq("owner_user_id", user.id)
      .limit(1)
      .maybeSingle();

    return brandRow ? "/dashboard" : "/onboarding";
  }, [supabase]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setMode("google");
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) {
        setError(oauthError.message);
        setMode("idle");
      }
      // On success, the browser is redirected to Google — no further work here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setMode("idle");
    }
  };

  const handleMagicLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    setError(null);
    setMode("magic");
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (otpError) {
        setError(otpError.message);
        setMode("idle");
        return;
      }
      setMagicLinkSent(true);
      setMode("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setMode("idle");
    }
  };

  // For users who already have a session, send them straight to the right place.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled && user) {
        const dest = await resolvePostLoginDestination();
        router.replace(dest);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, supabase, resolvePostLoginDestination]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Masuk ke Postiflow</CardTitle>
          <CardDescription>Lanjut ke konten rutin otomatis</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}

          {magicLinkSent ? (
            <div
              role="status"
              className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
            >
              Tautan login sudah kami kirim ke <strong>{email}</strong>. Silakan cek
              kotak masuk Anda.
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="default"
                size="default"
                className="h-10 w-full text-sm"
                onClick={handleGoogleSignIn}
                disabled={mode !== "idle"}
              >
                {mode === "google" ? "Menghubungkan..." : "Lanjut dengan Google"}
              </Button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">atau</span>
                </div>
              </div>

              <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="anda@bisnis.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={mode !== "idle"}
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="default"
                  className="h-10 w-full text-sm"
                  disabled={mode !== "idle" || !email}
                >
                  {mode === "magic" ? "Mengirim tautan..." : "Email Magic Link"}
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Dengan masuk, Anda menyetujui{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-foreground">
              Ketentuan Layanan
            </Link>{" "}
            dan{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-foreground">
              Kebijakan Privasi
            </Link>{" "}
            kami.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
