import { createAdminClient } from "@/lib/supabase/server";

/* Reads stockists from Supabase as one flat list — no region grouping.
   Everything shown on the site comes from the database, so an empty table
   renders an empty state rather than shops that do not exist. */
export async function getStockists() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("stockists")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data?.length) return { shops: [] };

    return {
      shops: data.map((row) => ({
        id: row.id,
        name: row.name,
        logo: row.logo_url || null,
        street: row.street,
        town: row.town,
        postcode: row.postcode,
        phone: row.phone || "",
        website: row.website || null,
      })),
    };
  } catch {
    return { shops: [] };
  }
}
