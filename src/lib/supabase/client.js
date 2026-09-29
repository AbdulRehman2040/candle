"use client";

import { createBrowserClient } from "@supabase/ssr";

/* Browser client. Uses the publishable key, so every query it makes is
   still subject to row level security — it can only ever see what the
   policies in supabase/schema.sql allow. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
