/* Receives wholesale enquiries from the form.
 *
 * TODO before launch: connect delivery. This handler validates and accepts
 * the enquiry but does not yet send it anywhere — add an email send
 * (Resend / Postmark / SES) or a CRM call where marked, and keep the
 * validation below as the gate. */

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

  /* --- Delivery goes here ------------------------------------------
     e.g. await resend.emails.send({ to: "wholesale@…", subject: …, text: … })
     Until then the enquiry is logged server-side only. */
  console.info("[wholesale enquiry]", {
    businessName: body.businessName,
    contactName: body.contactName,
    email: body.email,
    businessType: body.businessType,
    location: body.location,
    receivedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true }, { status: 200 });
}
