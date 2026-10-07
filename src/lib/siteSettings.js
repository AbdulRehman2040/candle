/* Site settings are kept as a small JSON file in the existing
   stockist-logos storage bucket, so no extra database table (and no SQL)
   is needed. Signed-in admins can already write to that bucket.

     settings/site.json → { "stockists_coming_soon": true | false }

   Works with either the browser client or the server's admin client. */

export const SETTINGS_BUCKET = "stockist-logos";
export const SETTINGS_PATH = "settings/site.json";

/* true = Where to Buy shows "Coming soon". Anything other than an
   explicit false (no file yet, unreadable file) counts as true, so
   placeholder shops are never shown by accident. */
export async function readComingSoon(supabase) {
  try {
    const { data, error } = await supabase.storage
      .from(SETTINGS_BUCKET)
      .download(SETTINGS_PATH, { cacheNonce: Date.now() });
    if (error || !data) return true;
    const json = JSON.parse(await data.text());
    return json.stockists_coming_soon !== false;
  } catch {
    return true;
  }
}

export async function writeComingSoon(supabase, value) {
  const body = new Blob([JSON.stringify({ stockists_coming_soon: value })], {
    type: "application/json",
  });
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(SETTINGS_PATH, body, {
      upsert: true,
      cacheControl: "0",
      contentType: "application/json",
    });
  return error;
}
