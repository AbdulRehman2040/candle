import { createAdminClient } from "@/lib/supabase/server";
import { readComingSoon } from "@/lib/siteSettings";

/* Whether the public Where to Buy page shows "Coming soon" instead of the
   shop list. Defaults to true if the setting cannot be read. */
export async function isStockistsComingSoon() {
  try {
    return await readComingSoon(createAdminClient());
  } catch {
    return true;
  }
}
