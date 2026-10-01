/* ==================================================================
   Stockist helpers.

   The stockist list itself lives in Supabase and is managed from
   /admin — there is deliberately no sample data here, so nothing can
   reach the site that is not a real shop.
================================================================== */

/** Opens the shop's address in whichever maps app the device uses. */
export function mapUrl(shop) {
  const query = [shop.name, shop.street, shop.town, shop.postcode]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

/** tel: needs the digits only — spaces break the link on some handsets. */
export function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}

/** Up to two initials, used when a shop has no logo of its own. */
export function monogram(name) {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
