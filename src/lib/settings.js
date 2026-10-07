import { createAdminClient } from "@/lib/supabase/server";

/* Whether the public Where to Buy page shows "Coming soon" instead of the
   shop list. Defaults to true when the setting cannot be read (e.g. the
   site_settings table has not been created yet), so placeholder shops are
   never shown by accident. */
export async function isStockistsComingSoon() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "stockists_coming_soon")
      .maybeSingle();

    if (error || !data) return true;
    return data.value !== false;
  } catch {
    return true;
  }
}
