import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RESEND_API_URL = "https://api.resend.com/emails";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Make sure a staff member is logged in.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Only admin and operations staff can trigger shipment notifications.
    const { data: staffProfile, error: staffError } = await supabase
      .from("staff_profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (
      staffError ||
      !staffProfile ||
      !["admin", "operations"].includes(staffProfile.role)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to send shipment notifications.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const shipmentId = body?.shipmentId;

    if (!shipmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipment ID is required.",
        },
        { status: 400 }
      );
    }

    // Get the shipment.
    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .select(
        `
        id,
        tracking_number,
        sender_name,
        receiver_name,
        receiver_email,
        sender_address,
        receiver_address,
        origin_country,
        destination_country,
        status,
        status_code,
        estimated_delivery_date,
        shipping_mode,
        service_type
        `
      )
      .eq("id", shipmentId)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipment could not be found.",
        },
        { status: 404 }
      );
    }

    if (!shipment.receiver_email) {
      return NextResponse.json({
        success: false,
        sent: false,
        error: "This shipment does not have a customer email address.",
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json(
        {
          success: false,
          sent: false,
          error: "RESEND_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * IMPORTANT:
     * Replace this with the verified email address/domain
     * you configure in Resend.
     */
    const fromEmail =
      process.env.PARCELPILOT_FROM_EMAIL ||
      "ParcelPilot Logistics <onboarding@resend.dev>";

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const trackingUrl = `${siteUrl}/track/${encodeURIComponent(
      shipment.tracking_number
    )}`;

    const estimatedDelivery = shipment.estimated_delivery_date
      ? new Date(
          shipment.estimated_delivery_date
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Not available yet";

    const emailSubject = `ParcelPilot shipment registered — ${shipment.tracking_number}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ParcelPilot Shipment Registered</title>
</head>

<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">

  <div style="max-width:680px;margin:40px auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

    <div style="background:#020617;padding:32px 30px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#ffffff;">
        ParcelPilot
      </div>

      <div style="margin-top:7px;color:#94a3b8;font-size:14px;">
        Logistics & Shipment Tracking
      </div>
    </div>

    <div style="padding:35px 30px;">

      <h1 style="margin:0 0 15px;font-size:25px;color:#0f172a;">
        Your shipment has been registered
      </h1>

      <p style="font-size:16px;line-height:1.7;color:#475569;">
        Hello ${escapeHtml(shipment.receiver_name || "Customer")},
      </p>

      <p style="font-size:16px;line-height:1.7;color:#475569;">
        Your shipment has been successfully registered with
        <strong>ParcelPilot Logistics</strong>.
        You can use your tracking number to follow the shipment status online.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:22px;margin:25px 0;">

        <div style="font-size:12px;text-transform:uppercase;color:#64748b;font-weight:700;">
          Tracking Number
        </div>

        <div style="font-size:25px;font-weight:800;color:#0f172a;margin-top:7px;">
          ${escapeHtml(shipment.tracking_number)}
        </div>

      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:20px;">

        <tr>
          <td style="padding:10px 0;color:#64748b;width:40%;">
            Status
          </td>

          <td style="padding:10px 0;font-weight:700;color:#0f172a;">
            ${escapeHtml(shipment.status || "Registered")}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;color:#64748b;">
            Origin
          </td>

          <td style="padding:10px 0;font-weight:600;color:#0f172a;">
            ${escapeHtml(shipment.origin_country || "Not specified")}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;color:#64748b;">
            Destination
          </td>

          <td style="padding:10px 0;font-weight:600;color:#0f172a;">
            ${escapeHtml(shipment.destination_country || "Not specified")}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;color:#64748b;">
            Service
          </td>

          <td style="padding:10px 0;font-weight:600;color:#0f172a;">
            ${escapeHtml(shipment.service_type || "Standard")}
          </td>
        </tr>

        <tr>
          <td style="padding:10px 0;color:#64748b;">
            Estimated Delivery
          </td>

          <td style="padding:10px 0;font-weight:600;color:#0f172a;">
            ${escapeHtml(estimatedDelivery)}
          </td>
        </tr>

      </table>

      <div style="text-align:center;margin:32px 0;">

        <a
          href="${trackingUrl}"
          style="
            display:inline-block;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            padding:14px 25px;
            border-radius:10px;
            font-weight:700;
          "
        >
          Track Your Shipment
        </a>

      </div>

      <p style="font-size:13px;line-height:1.7;color:#64748b;">
        If you did not expect this shipment notification, please contact
        ParcelPilot Logistics support.
      </p>

    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 30px;text-align:center;">

      <div style="font-weight:700;color:#334155;">
        ParcelPilot Logistics
      </div>

      <div style="font-size:12px;color:#64748b;margin-top:5px;">
        Every delivery. Right on track.
      </div>

    </div>

  </div>

</body>
</html>
`;

    const text = `
ParcelPilot Logistics

Your shipment has been registered.

Hello ${shipment.receiver_name || "Customer"},

Your shipment has been successfully registered with ParcelPilot Logistics.

Tracking Number: ${shipment.tracking_number}
Status: ${shipment.status || "Registered"}
Origin: ${shipment.origin_country || "Not specified"}
Destination: ${shipment.destination_country || "Not specified"}
Service: ${shipment.service_type || "Standard"}
Estimated Delivery: ${estimatedDelivery}

Track your shipment:
${trackingUrl}

This notification was sent because your shipment was registered with ParcelPilot Logistics.
`;

    // Record notification as pending before sending.
    const { data: notification, error: notificationInsertError } =
      await supabase
        .from("shipment_notifications")
        .insert({
          shipment_id: shipment.id,
          tracking_number: shipment.tracking_number,
          channel: "email",
          recipient: shipment.receiver_email,
          notification_type: "shipment_created",
          status: "pending",
        })
        .select("id")
        .single();

    if (notificationInsertError) {
      console.error(
        "Could not create notification record:",
        notificationInsertError
      );
    }

    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [shipment.receiver_email],
        subject: emailSubject,
        html,
        text,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      const errorMessage =
        resendData?.message ||
        resendData?.error ||
        "Resend failed to send the email.";

      if (notification?.id) {
        await supabase
          .from("shipment_notifications")
          .update({
            status: "failed",
            error_message: String(errorMessage),
          })
          .eq("id", notification.id);
      }

      return NextResponse.json({
        success: false,
        sent: false,
        error: String(errorMessage),
      });
    }

    if (notification?.id) {
      await supabase
        .from("shipment_notifications")
        .update({
          status: "sent",
          provider_message_id: resendData?.id || null,
        })
        .eq("id", notification.id);
    }

    return NextResponse.json({
      success: true,
      sent: true,
      messageId: resendData?.id || null,
    });
  } catch (error) {
    console.error("Shipment notification error:", error);

    return NextResponse.json(
      {
        success: false,
        sent: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected notification error.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}