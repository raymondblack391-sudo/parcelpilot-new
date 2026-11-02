import { NextResponse, after } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BOT =
  /bot|crawl|spider|preview|scan|monitor|curl|wget|python|headless|googleimageproxy|barracuda|proofpoint|mimecast|safelinks/i;
const COOLDOWN_MS = 60 * 60 * 1000;
const TABLE = "link_click_alerts";

async function notify(
  trackingNumber: string,
  userAgent: string,
  country: string,
  city: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!apiKey || !from || !supabaseUrl || !secret) return;

  const supabase = createClient(supabaseUrl, secret);

  const { data: shipment } = await supabase
    .from("shipments")
    .select("tracking_number, receiver_name, customer_email, status")
    .eq("tracking_number", trackingNumber)
    .maybeSingle();
  if (!shipment) return;

  const { data: row } = await supabase
    .from(TABLE)
    .select("last_alert_at, click_count")
    .eq("tracking_number", shipment.tracking_number)
    .maybeSingle();

  const now = Date.now();
  const last = row?.last_alert_at ? new Date(row.last_alert_at).getTime() : 0;
  const count = (row?.click_count ?? 0) + 1;

  if (now - last < COOLDOWN_MS) {
    await supabase
      .from(TABLE)
      .update({ click_count: count })
      .eq("tracking_number", shipment.tracking_number);
    return;
  }

  await supabase.from(TABLE).upsert(
    {
      tracking_number: shipment.tracking_number,
      last_alert_at: new Date(now).toISOString(),
      click_count: count,
    },
    { onConflict: "tracking_number" }
  );

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: [process.env.ALERT_EMAIL || "support@parcelpilotlogistics.com"],
    subject: `Customer opened tracking link - ${shipment.tracking_number}`,
    text: `A customer clicked the tracking link.

Tracking number: ${shipment.tracking_number}
Receiver: ${shipment.receiver_name || "Unknown"}
Customer email: ${shipment.customer_email || "Unknown"}
Status: ${shipment.status || "Unknown"}
Time (UTC): ${new Date(now).toISOString()}
Approx. location: ${[city, country].filter(Boolean).join(", ") || "Unknown"}
Total clicks so far: ${count}

Device: ${userAgent.slice(0, 200)}

Note: some email security scanners open links automatically, so an alert is not a guarantee that the customer read the message.`,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  const { trackingNumber: rawValue } = await params;

  let trackingNumber = "";
  try {
    trackingNumber = decodeURIComponent(rawValue).trim();
  } catch {
    trackingNumber = "";
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.parcelpilotlogistics.com"
  ).replace(/\/$/, "");

  if (!/^[A-Za-z0-9-]{3,40}$/.test(trackingNumber)) {
    return NextResponse.redirect(`${siteUrl}/track`, 302);
  }

  const userAgent = request.headers.get("user-agent") || "";
  const isBot = request.method === "HEAD" || !userAgent || BOT.test(userAgent);

  if (!isBot) {
    const country = request.headers.get("x-vercel-ip-country") || "";
    const city = decodeURIComponent(
      request.headers.get("x-vercel-ip-city") || ""
    );
    after(async () => {
      try {
        await notify(trackingNumber, userAgent, country, city);
      } catch (error) {
        console.error("TRACK CLICK ALERT FAILED:", error);
      }
    });
  }

  const response = NextResponse.redirect(
    `${siteUrl}/track/${encodeURIComponent(trackingNumber)}`,
    302
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
