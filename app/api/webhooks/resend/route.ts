import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    created_at?: string;
    [key: string]: unknown;
  };
};

function normalizeEventType(type: string) {
  const value = type.toLowerCase();

  if (value === "email.sent") {
    return "sent";
  }

  if (value === "email.delivered") {
    return "delivered";
  }

  if (value === "email.opened") {
    return "opened";
  }

  if (value === "email.clicked") {
    return "clicked";
  }

  if (value === "email.bounced") {
    return "bounced";
  }

  if (value === "email.failed") {
    return "failed";
  }

  if (value === "email.delivery_delayed") {
    return "delivery_delayed";
  }

  return value.replace(/^email\./, "") || "unknown";
}

export async function POST(request: Request) {
  try {
    const webhookSecret =
      process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RESEND_WEBHOOK_SECRET is missing."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Webhook configuration is missing.",
        },
        { status: 500 }
      );
    }

    /*
     * Resend signs webhook requests with Svix.
     * Always verify the raw request body before parsing it.
     */
    const payloadText = await request.text();

    const resend = new Resend(
      process.env.RESEND_API_KEY || ""
    );

    let payload: ResendWebhookEvent;

    try {
      payload = resend.webhooks.verify({
        payload: payloadText,
        headers: {
          id:
            request.headers.get("svix-id") || "",
          timestamp:
            request.headers.get("svix-timestamp") || "",
          signature:
            request.headers.get("svix-signature") || "",
        },
        webhookSecret,
      }) as unknown as ResendWebhookEvent;
    } catch (verificationError) {
      console.error(
        "Rejected Resend webhook: invalid signature.",
        verificationError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid webhook signature.",
        },
        { status: 401 }
      );
    }

    const eventType =
      typeof payload.type === "string"
        ? payload.type.trim()
        : "";

    const normalizedEventType =
      normalizeEventType(eventType);

    const data = payload.data || {};

    const resendEmailId =
      typeof data.email_id === "string"
        ? data.email_id
        : typeof data.id === "string"
          ? data.id
          : null;

    const recipients =
      Array.isArray(data.to)
        ? data.to.filter(
            (item): item is string =>
              typeof item === "string"
          )
        : [];

    const recipientEmail =
      recipients[0]?.trim() || "";

    if (!recipientEmail) {
      console.error(
        "Resend webhook did not contain a recipient email."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Recipient email is missing.",
        },
        { status: 400 }
      );
    }

    const subject =
      typeof data.subject === "string"
        ? data.subject
        : null;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseServiceKey =
      process.env.SUPABASE_SECRET_KEY;

    if (
      !supabaseUrl ||
      !supabaseServiceKey
    ) {
      console.error(
        "Supabase server configuration is missing."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase server configuration is missing.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * Match the webhook to the original email using
     * Resend's email ID.
     */
    let shipmentId: string | null = null;
    let trackingNumber: string | null = null;
    let emailType = "shipment_notification";

    if (resendEmailId) {
      const { data: previousEmail } =
        await supabase
          .from("email_activity")
          .select(
            "shipment_id, tracking_number, email_type"
          )
          .eq(
            "resend_email_id",
            resendEmailId
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (previousEmail) {
        shipmentId =
          previousEmail.shipment_id || null;

        trackingNumber =
          previousEmail.tracking_number || null;

        emailType =
          previousEmail.email_type ||
          emailType;
      }
    }

    /*
     * If we don't have an existing activity record yet,
     * try to identify the shipment from the subject.
     *
     * Example:
     * ParcelPilot Shipment Created - PP536199
     */
    if (!trackingNumber && subject) {
      const match = subject.match(
        /\bPP[A-Z0-9-]+\b/i
      );

      if (match?.[0]) {
        trackingNumber =
          match[0].toUpperCase();

        const { data: shipment } =
          await supabase
            .from("shipments")
            .select("id, tracking_number")
            .eq(
              "tracking_number",
              trackingNumber
            )
            .maybeSingle();

        if (shipment) {
          shipmentId = shipment.id;
        }
      }
    }

    /*
     * Prevent duplicate webhook events.
     */
    if (resendEmailId) {
      const { data: duplicate } =
        await supabase
          .from("email_activity")
          .select("id")
          .eq(
            "resend_email_id",
            resendEmailId
          )
          .eq(
            "event_type",
            normalizedEventType
          )
          .limit(1)
          .maybeSingle();

      if (duplicate) {
        return NextResponse.json({
          success: true,
          duplicate: true,
        });
      }
    }

    const { error } = await supabase
      .from("email_activity")
      .insert({
        shipment_id: shipmentId,
        tracking_number: trackingNumber,
        recipient_email: recipientEmail,
        email_type: emailType,
        event_type: normalizedEventType,
        resend_email_id: resendEmailId,
        subject,
        event_data: payload,
      });

    if (error) {
      console.error(
        "Failed to save email activity:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to save email activity.",
        },
        { status: 500 }
      );
    }

    console.log(
      "PARCELPILOT EMAIL ACTIVITY:",
      {
        eventType: normalizedEventType,
        recipientEmail,
        trackingNumber,
        resendEmailId,
      }
    );

    return NextResponse.json({
      success: true,
      eventType: normalizedEventType,
      trackingNumber,
      resendEmailId,
    });
  } catch (error) {
    console.error(
      "RESEND WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
