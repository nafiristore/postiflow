// Browser-side Supabase client. Falls back to a no-op mock when env vars
// are missing so that production builds don't crash during static generation.

import { createBrowserClient } from "@supabase/ssr";

type AnyClient = ReturnType<typeof createBrowserClient>;

const HAS_ENV =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

/**
 * Minimal mock that mirrors the small slice of the Supabase API the UI uses.
 * Any call resolves with an empty payload, which lets pages render during
 * the build / preview phase before real credentials are configured.
 */
function createMockClient(): AnyClient {
  const emptyAuth = {
    data: { user: null, session: null },
    error: null as unknown as Error,
  };
  return {
    auth: {
      getUser: async () => emptyAuth,
      getSession: async () => emptyAuth,
      signInWithOAuth: async () => ({ data: { provider: "", url: "" }, error: null }),
      signInWithOtp: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
    },
    from: () => ({
      select: () => ({ data: [], error: null, count: 0 }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: function () { return this; },
      order: function () { return this; },
      limit: function () { return this; },
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
    }),
  } as unknown as AnyClient;
}

export function createClient(): AnyClient {
  if (!HAS_ENV) {
    if (typeof window !== "undefined") {
      // Only log in the browser to avoid noisy server logs.
      console.warn(
        "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY — using mock client.",
      );
    }
    return createMockClient();
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
