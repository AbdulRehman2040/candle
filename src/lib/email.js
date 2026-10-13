/* Email through Resend (https://resend.com), sent with a plain fetch so
 * no extra package is needed.
 *
 * Configured entirely from environment variables (.env.local on the
 * server, which git ignores):
 *
 *   RESEND_API_KEY   API key from the Resend dashboard
 *   EMAIL_FROM       sender on a domain verified in Resend,
 *                    e.g. "Fondue Flame <hello@yourdomain.co.uk>"
 *   LEAD_NOTIFY_TO   who is told about new enquiries; comma separated
 *   LEAD_AUTOREPLY   set to "off" to stop the thank-you email to the sender
 *   SITE_URL         optional, e.g. https://yourdomain.co.uk — adds a
 *                    link to the dashboard in the team email
 *
 * Nothing here throws. Email is a convenience on top of the saved lead,
 * so every failure is logged and swallowed rather than passed on. */

const ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;

const list = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]
  );

/* Visitor text ends up in the subject line, so keep it to one short line */
const oneLine = (value, max = 80) =>
  String(value).replace(/\s+/g, " ").trim().slice(0, max);

async function send({ to, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(
      "[email] not sent: RESEND_API_KEY or EMAIL_FROM is not set —",
      subject
    );
    return false;
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      /* Resend explains the problem in the body — an unverified domain,
         a bad key — which is exactly what is needed to fix it. */
      const detail = await response.text().catch(() => "");
      console.error(
        `[email] Resend refused (${response.status}) "${subject}":`,
        detail
      );
      return false;
    }
    return true;
  } catch (cause) {
    console.error(`[email] could not reach Resend for "${subject}":`, cause);
    return false;
  }
}

/* Shared frame so both emails look like they come from the same place */
const frame = (body) => `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f1ea;font-family:Helvetica,Arial,sans-serif;color:#2b1d14">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px">
${body}
<p style="margin:32px 0 0;font-size:12px;color:#8a7a6d">Fondue Flame</p>
</div>
</body></html>`;

function teamEmail(lead) {
  const rows = [
    ["Business", lead.businessName],
    ["Contact", lead.contactName],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Website / social", lead.website],
    ["Business type", lead.businessType],
    ["Location", lead.location],
    ["Estimated quantity", lead.quantity],
    ["Message", lead.message],
  ].filter(([, value]) => value);

  const site = (process.env.SITE_URL || "").replace(/\/+$/, "");
  const dashboard = site ? `${site}/admin/leads` : "";

  const html = frame(`
<h1 style="margin:0 0 8px;font-size:20px;font-weight:500">New wholesale enquiry</h1>
<p style="margin:0 0 24px;color:#5c4a3d">From ${escape(lead.businessName)}. Reply to this email to answer ${escape(lead.contactName)} directly.</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">
${rows
  .map(
    ([label, value]) => `<tr>
<td style="padding:8px 12px 8px 0;vertical-align:top;color:#8a7a6d;white-space:nowrap">${escape(label)}</td>
<td style="padding:8px 0;vertical-align:top;white-space:pre-wrap">${escape(value)}</td>
</tr>`
  )
  .join("\n")}
</table>
${
  dashboard
    ? `<p style="margin:24px 0 0"><a href="${escape(dashboard)}" style="color:#9c4a1a">Open in the dashboard</a></p>`
    : ""
}`);

  const text = [
    `New wholesale enquiry from ${lead.businessName}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(dashboard ? ["", `Dashboard: ${dashboard}`] : []),
  ].join("\n");

  return {
    subject: `New wholesale enquiry: ${oneLine(lead.businessName)}`,
    html,
    text,
  };
}

function acknowledgementEmail(lead) {
  const name = oneLine(lead.contactName, 60);
  const html = frame(`
<h1 style="margin:0 0 16px;font-size:20px;font-weight:500">Thank you, ${escape(name)}</h1>
<p style="margin:0 0 12px;line-height:1.6">We've received your wholesale enquiry for ${escape(lead.businessName)} and a member of the team will be in touch soon.</p>
<p style="margin:0;line-height:1.6">If there's anything you'd like to add in the meantime, just reply to this email.</p>`);

  const text = [
    `Thank you, ${name}`,
    "",
    `We've received your wholesale enquiry for ${lead.businessName} and a member of the team will be in touch soon.`,
    "",
    "If there's anything you'd like to add in the meantime, just reply to this email.",
    "",
    "Fondue Flame",
  ].join("\n");

  return {
    subject: "Thanks for your wholesale enquiry | Fondue Flame",
    html,
    text,
  };
}

/* Tells the team about a new enquiry and thanks the sender. Takes the
 * validated, trimmed form values. Resolves once both attempts finish;
 * never rejects. */
export async function sendLeadEmails(lead) {
  const team = list(process.env.LEAD_NOTIFY_TO);
  const jobs = [];

  if (team.length) {
    /* reply_to is the sender, so the team can answer with one click */
    jobs.push(send({ to: team, replyTo: lead.email, ...teamEmail(lead) }));
  } else {
    console.warn("[email] LEAD_NOTIFY_TO is not set; team not notified");
  }

  if (process.env.LEAD_AUTOREPLY !== "off") {
    /* ...and replies to the thank-you reach the team, not a no-reply box */
    jobs.push(
      send({
        to: [lead.email],
        replyTo: team.length ? team : undefined,
        ...acknowledgementEmail(lead),
      })
    );
  }

  await Promise.allSettled(jobs);
}
