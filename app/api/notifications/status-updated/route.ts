import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.PARCELPILOT_FROM_EMAIL ||
      "ParcelPilot Logistics <onboarding@resend.dev>";

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const recipient =
      typeof body.customerEmail === "string"
        ? body.customerEmail.trim()
        : typeof body.receiverEmail === "string"
          ? body.receiverEmail.trim()
          : "";

    const trackingNumber =
      typeof body.trackingNumber === "string"
        ? body.trackingNumber.trim()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status.trim()
        : "";

    const statusCode =
      typeof body.statusCode === "string"
        ? body.statusCode.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    const receiverName =
      typeof body.receiverName === "string"
        ? body.receiverName.trim()
        : "Customer";

    const originCountry =
      typeof body.originCountry === "string"
        ? body.originCountry.trim()
        : "Origin";

    const destinationCountry =
      typeof body.destinationCountry === "string"
        ? body.destinationCountry.trim()
        : "Destination";

    if (!recipient) {
      return NextResponse.json(
        {
          success: false,
          error: "No customer email address was provided.",
        },
        { status: 400 }
      );
    }

    if (!trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking number is required.",
        },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipment status is required.",
        },
        { status: 400 }
      );
    }

    const trackUrl =
      `https://parcelpilot-new.vercel.app/track/${encodeURIComponent(
        trackingNumber
      )}`;

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject: `ParcelPilot Shipment Update - ${trackingNumber} - ${status}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ParcelPilot Shipment Update</title>
</head>

<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">

  <div style="max-width:680px;margin:0 auto;padding:40px 20px;">

    <div style="background:#0f172a;border-radius:16px 16px 0 0;padding:30px;text-align:center;">
      <div style="font-size:30px;font-weight:800;color:#ffffff;">
        ParcelPilot
      </div>

      <div style="font-size:14px;color:#cbd5e1;margin-top:6px;">
        Every delivery. Right on track.
      </div>
    </div>

    <div style="background:#ffffff;padding:36px 30px;border-radius:0 0 16px 16px;">

      <h1 style="margin:0 0 12px;font-size:26px;">
        Shipment Update
      </h1>

      <p style="font-size:16px;line-height:1.6;color:#475569;">
        Hello ${receiverName},
      </p>

      <p style="font-size:16px;line-height:1.6;color:#475569;">
        There has been an update to your ParcelPilot shipment.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:28px 0;text-align:center;">

        <div style="font-size:13px;color:#64748b;text-transform:uppercase;font-weight:700;">
          Current Status
        </div>

        <div style="font-size:26px;font-weight:800;color:#1d4ed8;margin-top:8px;">
          ${status}
        </div>

        ${
          statusCode
            ? `
        <div style="font-size:12px;color:#64748b;margin-top:8px;">
          ${statusCode}
        </div>
        `
            : ""
        }

      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:28px 0;">

        <div style="font-size:13px;color:#64748b;text-transform:uppercase;font-weight:700;">
          Tracking Number
        </div>

        <div style="font-size:28px;font-weight:800;color:#0f172a;margin-top:8px;">
          ${trackingNumber}
        </div>

      </div>

      <table style="width:100%;border-collapse:collapse;font-size:15px;">

        <tr>
          <td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">
            Route
          </td>

          <td style="padding:12px 0;text-align:right;font-weight:700;border-bottom:1px solid #e2e8f0;">
            ${originCountry} → ${destinationCountry}
          </td>
        </tr>

        ${
          location
            ? `
        <tr>
          <td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">
            Current Location
          </td>

          <td style="padding:12px 0;text-align:right;font-weight:700;border-bottom:1px solid #e2e8f0;">
            ${location}
          </td>
        </tr>
        `
            : ""
        }

      </table>

      ${
        description
          ? `
      <div style="margin:28px 0;padding:20px;background:#f8fafc;border-left:4px solid #2563eb;">
        <div style="font-size:13px;color:#64748b;font-weight:700;margin-bottom:8px;">
          Update Details
        </div>

        <div style="font-size:15px;line-height:1.6;color:#475569;">
          ${description}
        </div>
      </div>
      `
          : ""
      }

      <div style="text-align:center;margin:35px 0 20px;">

        <a
          href="${trackUrl}"
          style="
            display:inline-block;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            padding:15px 28px;
            border-radius:10px;
            font-weight:700;
          "
        >
          Track Shipment
        </a>

      </div>

      <p style="font-size:13px;line-height:1.6;color:#94a3b8;text-align:center;margin-top:30px;">
        You will receive another notification when your shipment status changes.
      </p>

    </div>

    <div style="text-align:center;padding:22px;font-size:12px;color:#94a3b8;">
      ParcelPilot Logistics
    </div>

  </div>

</body>
</html>
      `,
    });

    if (result.error) {
      const resendError = result.error;

      const errorMessage =
        resendError &&
        typeof resendError === "object" &&
        "message" in resendError &&
        typeof resendError.message === "string"
          ? resendError.message
          : "Resend rejected the email.";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: result.data?.id || null,
      recipient,
      trackingNumber,
      status,
    });
  } catch (error) {
    console.error("STATUS EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send shipment status email.",
      },
      { status: 500 }
    );
  }
}
