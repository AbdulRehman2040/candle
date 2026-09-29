import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/* Server client bound to the request's cookies, so it knows who is
   signed in. Still runs under row level security. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* Called from a Server Component — middleware refreshes the
               session instead, so this is safe to ignore. */
          }
        },
      },
    }
  );
}

/* Service-role client. BYPASSES row level security, so it must only ever
   be created in server code and never handed anything a visitor typed
   without validating it first. Used for writing wholesale leads, which
   have no public insert policy by design. */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
