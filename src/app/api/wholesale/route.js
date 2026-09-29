import { createAdminClient } from "@/lib/supabase/server";

/* Receives wholesale enquiries from the form and stores them as leads.
 *
 * Writes use the service-role client, which bypasses row level security.
 * That is deliberate: `leads` has no public insert policy, so the table
 * cannot be written to straight from a browser. Everything that reaches
 * the insert below has passed the validation in this file first. */

const REQUIRED = ["businessName", "contactName", "email", "businessType", "location"];
const MAX = 4000;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const missing = REQUIRED.filter(
    (key) => typeof body?.[key] !== "string" || body[key].trim() === ""
  );
  if (missing.length) {
    return Response.json({ error: "Missing fields", missing }, { status: 422 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email.trim())) {
    return Response.json({ error: "Invalid email" }, { status: 422 });
  }

  const oversized = Object.values(body).some(
    (value) => typeof value === "string" && value.length > MAX
  );
  if (oversized) {
    return Response.json({ error: "Field too long" }, { status: 413 });
  }

  const text = (value) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("leads").insert({
      name: body.contactName.trim(),
      email: body.email.trim().toLowerCase(),
      business_name: body.businessName.trim(),
      phone: text(body.phone),
      business_type: body.businessType.trim(),
      website: text(body.website),
      /* Location is part of the enquiry but has no column of its own —
         it is kept with the message so nothing the sender typed is lost. */
      message: [text(body.message), `Location: ${body.location.trim()}`]
        .filter(Boolean)
        .join("\n\n"),
      status: "new",
    });

    if (error) {
      /* Log the detail server-side; the sender only needs to know it
         failed, not why. */
      console.error("[wholesale enquiry] insert failed:", error.message);
      return Response.json(
        { error: "Could not save enquiry" },
        { status: 500 }
      );
    }
  } catch (cause) {
    console.error("[wholesale enquiry] unexpected error:", cause);
    return Response.json({ error: "Could not save enquiry" }, { status: 500 });
  }

  /* TODO: optional email notification (Resend / Postmark / SES) so the
     team is alerted without opening the dashboard. The lead is saved
     either way, so this is a convenience rather than a dependency. */

  return Response.json({ ok: true }, { status: 200 });
}
