// Server-side Supabase client. Falls back to a no-op mock when env vars
// are missing so that production builds don't crash during static generation.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type AnyClient = ReturnType<typeof createServerClient>;

const HAS_ENV =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

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

export async function createClient(): Promise<AnyClient> {
  if (!HAS_ENV) {
    return createMockClient();
  }
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component without a response context.
          }
        },
      },
    },
  );
}
