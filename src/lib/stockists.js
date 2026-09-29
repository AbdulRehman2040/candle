import { createAdminClient } from "@/lib/supabase/server";
import { REGIONS as FALLBACK_REGIONS } from "@/data/stockists";

/* Reads stockists from Supabase, grouped by region for the public pages.
   If the table is empty or unreachable the static placeholder data is
   used instead, so the site never renders an empty Where to Buy. */
export async function getStockists() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("stockists")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data?.length) {
      return { regions: FALLBACK_REGIONS, fromDatabase: false };
    }

    /* Group into the shape the components already expect */
    const byRegion = new Map();
    for (const row of data) {
      const name = row.region || "Other";
      if (!byRegion.has(name)) {
        byRegion.set(name, {
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          name,
          shops: [],
        });
      }
      byRegion.get(name).shops.push({
        name: row.name,
        logo: row.logo_url || null,
        street: row.street,
        town: row.town,
        postcode: row.postcode,
        phone: row.phone || "",
        website: row.website || null,
        note: null,
      });
    }

    return { regions: [...byRegion.values()], fromDatabase: true };
  } catch {
    return { regions: FALLBACK_REGIONS, fromDatabase: false };
  }
}
