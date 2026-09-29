/* ==================================================================
   STOCKISTS — PLACEHOLDER DATA

   ⚠️  EVERY ENTRY BELOW IS INVENTED. None of these shops exist.
   They are here only so the page can be built and reviewed.

   Replace with the real stockist list before launch. Nothing in this
   file should ever go in front of a customer as-is: publishing invented
   shop names, addresses and phone numbers would send people to places
   that are not there.

   Phone numbers use Ofcom's reserved fictional range (01632 960xxx),
   which is guaranteed never to connect to a real line.

   PLACEHOLDER is read by the page. While it is true the page shows a
   visible banner saying the list is not real. Set it to false only once
   this file holds genuine stockists.

   FIELDS PER SHOP
     name     shop name
     logo     path under /public (e.g. "/stockists/acme.png"), or null
              to fall back to a monogram built from the name
     street   first address line
     town     town or city
     postcode UK postcode
     phone    display form; tel: link is derived by stripping spaces
     note     optional small line under the address
================================================================== */

export const PLACEHOLDER = true;

export const REGIONS = [
  {
    id: "london",
    name: "London & the South East",
    shops: [
      {
        name: "Example Fine Foods",
        logo: null,
        street: "00 Placeholder Street",
        town: "London",
        postcode: "SW0 0AA",
        phone: "01632 960111",
        note: "Sample entry — not a real shop",
      },
      {
        name: "Sample Delicatessen",
        logo: null,
        street: "00 Example Lane",
        town: "Brighton",
        postcode: "BN0 0AA",
        phone: "01632 960222",
        note: "Sample entry — not a real shop",
      },
    ],
  },
  {
    id: "south-west",
    name: "The South West",
    shops: [
      {
        name: "Placeholder Pantry",
        logo: null,
        street: "00 Sample Road",
        town: "Bristol",
        postcode: "BS0 0AA",
        phone: "01632 960333",
        note: "Sample entry — not a real shop",
      },
    ],
  },
  {
    id: "midlands",
    name: "The Midlands",
    shops: [
      {
        name: "Example Gift Company",
        logo: null,
        street: "00 Placeholder Way",
        town: "Birmingham",
        postcode: "B0 0AA",
        phone: "01632 960444",
        note: "Sample entry — not a real shop",
      },
    ],
  },
  {
    id: "north",
    name: "The North",
    shops: [
      {
        name: "Sample Home & Living",
        logo: null,
        street: "00 Example Street",
        town: "Manchester",
        postcode: "M0 0AA",
        phone: "01632 960555",
        note: "Sample entry — not a real shop",
      },
      {
        name: "Placeholder Provisions",
        logo: null,
        street: "00 Sample Parade",
        town: "Leeds",
        postcode: "LS0 0AA",
        phone: "01632 960666",
        note: "Sample entry — not a real shop",
      },
    ],
  },
  {
    id: "scotland-wales-ni",
    name: "Scotland, Wales & Northern Ireland",
    shops: [
      {
        name: "Example Trading Post",
        logo: null,
        street: "00 Placeholder Close",
        town: "Edinburgh",
        postcode: "EH0 0AA",
        phone: "01632 960777",
        note: "Sample entry — not a real shop",
      },
    ],
  },
];

/* Online sellers. `href` stays null until a real URL exists — the page
   renders a non-link when it is null rather than a dead anchor. */
export const ONLINE = [
  { name: "Example Online Store", detail: "Sample entry — not a real seller", href: null },
  { name: "Placeholder Marketplace", detail: "Sample entry — not a real seller", href: null },
];

export const TOTAL_SHOPS = REGIONS.reduce((n, r) => n + r.shops.length, 0);

/* --- Helpers -------------------------------------------------------- */

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
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
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
