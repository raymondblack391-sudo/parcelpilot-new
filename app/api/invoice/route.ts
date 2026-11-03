import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function tooMany(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

const NOT_FOUND = {
  success: false,
  error: "We could not find an invoice for that tracking number and email.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const trackingNumber = String(body.trackingNumber || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!/^[A-Za-z0-9-]{3,40}$/.test(trackingNumber) || !email.includes("@")) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (tooMany(`${ip}:${trackingNumber.toUpperCase()}`)) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) {
      return NextResponse.json(
        { success: false, error: "Invoice service is not configured." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, secret);
    const { data: shipment } = await supabase
      .from("shipments")
      .select("*")
      .eq("tracking_number", trackingNumber)
      .maybeSingle();

    const stored = String(shipment?.customer_email || "").trim().toLowerCase();
    if (!shipment || !stored || stored !== email) {
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ready: true,
      invoice: {
        number: `INV-${shipment.tracking_number}`,
        date: shipment.created_at,
        trackingNumber: shipment.tracking_number,
        status: shipment.status,
        senderName: shipment.sender_name,
        senderAddress: shipment.sender_address,
        receiverName: shipment.receiver_name,
        receiverAddress: shipment.receiver_address,
        originCountry: shipment.origin_country,
        destinationCountry: shipment.destination_country,
        shippingMode: shipment.shipping_mode,
        serviceType: shipment.service_type,
        packageCount: shipment.package_count,
        packageWeight: shipment.package_weight,
        awbNumber: shipment.awb_number,
        flightNumber: shipment.flight_number,
        estimatedDelivery: shipment.estimated_delivery_date,
      },
    });
  } catch (error) {
    console.error("INVOICE ROUTE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load the invoice." },
      { status: 500 }
    );
  }
}
