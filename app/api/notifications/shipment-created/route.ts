import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    console.log("========================================");
    console.log("PARCELPILOT SHIPMENT EMAIL START");
    console.log("========================================");

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.PARCELPILOT_FROM_EMAIL ||
      "ParcelPilot Logistics <onboarding@resend.dev>";

    console.log(
      "RESEND_API_KEY:",
      apiKey ? "CONFIGURED" : "MISSING"
    );

    console.log("RESEND_FROM_EMAIL:", fromEmail);

    if (!apiKey) {
      console.error("RESEND_API_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    console.log("EMAIL REQUEST BODY:", {
      customerEmail: body.customerEmail,
      receiverEmail: body.receiverEmail,
      trackingNumber: body.trackingNumber,
    });

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

    if (!recipient) {
      console.error("No recipient email was provided.");

      return NextResponse.json(
        {
          success: false,
          error: "No customer email address was provided.",
        },
        { status: 400 }
      );
    }

    if (!trackingNumber) {
      console.error("No tracking number was provided.");

      return NextResponse.json(
        {
          success: false,
          error: "Tracking number is required.",
        },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const originCountry = body.originCountry || "Origin";
    const destinationCountry = body.destinationCountry || "Destination";
    const shippingMode = body.shippingMode || "Air Freight";
    const serviceType = body.serviceType || "Standard";
    const senderName = body.senderName || "Sender";
    const receiverName = body.receiverName || "Customer";
    const estimatedDeliveryDate =
      body.estimatedDeliveryDate || "To be confirmed";

    const trackUrl =
      `https://parcelpilot-new.vercel.app/track/${encodeURIComponent(
        trackingNumber
      )}`;

    console.log("SENDING EMAIL:");
    console.log("FROM:", fromEmail);
    console.log("TO:", recipient);
    console.log("SUBJECT:", `ParcelPilot Shipment Created - ${trackingNumber}`);

    const result = await resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject: `ParcelPilot Shipment Created - ${trackingNumber}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ParcelPilot Shipment Created</title>
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
        Shipment Created
      </h1>

      <p style="font-size:16px;line-height:1.6;color:#475569;">
        Hello ${receiverName},
      </p>

      <p style="font-size:16px;line-height:1.6;color:#475569;">
        Your ParcelPilot shipment has been successfully created and is now registered in our tracking system.
      </p>

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
            Sender
          </td>

          <td style="padding:12px 0;text-align:right;font-weight:700;border-bottom:1px solid #e2e8f0;">
            ${senderName}
          </td>
        </tr>

        <tr>
          <td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">
            Route
          </td>

          <td style="padding:12px 0;text-align:right;font-weight:700;border-bottom:1px solid #e2e8f0;">
            ${originCountry} → ${destinationCountry}
          </td>
        </tr>

        <tr>
          <td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">
            Shipping Mode
          </td>

          <td style="padding:12px 0;text-align:right;font-weight:700;border-bottom:1px solid #e2e8f0;">
            ${shippingMode}
          </td>
        </tr>

        <tr>
          <td style="padding:12px 0;color:#64748b;border-bottom:1px solid #e2e8f0;">
            Service
          </td>

          <td style="padding:12px 0;text-align:right;font-weight:700;border-bottom:1px solid #e2e8f0;">
            ${serviceType}
          </td>
        </tr>

        <tr>
          <td style="padding:12px 0;color:#64748b;">
            Estimated Delivery
          </td>

          <td style="padding:12px 0;text-align:right;font-weight:700;">
            ${estimatedDeliveryDate}
          </td>
        </tr>

      </table>

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
        Please keep your tracking number for future shipment updates.
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

    console.log("RESEND RAW RESULT:", result);

    if (result.error) {
      const resendError = result.error;

      let errorMessage = "Resend rejected the email.";

      if (
        resendError &&
        typeof resendError === "object" &&
        "message" in resendError &&
        typeof resendError.message === "string"
      ) {
        errorMessage = resendError.message;
      }

      const errorName =
        resendError &&
        typeof resendError === "object" &&
        "name" in resendError &&
        typeof resendError.name === "string"
          ? resendError.name
          : null;

      const statusCode =
        resendError &&
        typeof resendError === "object" &&
        "statusCode" in resendError &&
        typeof resendError.statusCode === "number"
          ? resendError.statusCode
          : null;

      console.error("========================================");
      console.error("RESEND EMAIL FAILED");
      console.error("ERROR MESSAGE:", errorMessage);
      console.error("ERROR NAME:", errorName);
      console.error("STATUS CODE:", statusCode);
      console.error(
        "FULL ERROR:",
        JSON.stringify(resendError, null, 2)
      );
      console.error("========================================");

      return NextResponse.json(
        {
          success: false,
          error: String(errorMessage),
          errorName: errorName ? String(errorName) : null,
          statusCode,
        },
        { status: 502 }
      );
    }

    const emailId = result.data?.id || null;

    console.log("========================================");
    console.log("SHIPMENT EMAIL SENT SUCCESSFULLY");
    console.log("EMAIL ID:", emailId);
    console.log("TO:", recipient);
    console.log("========================================");

    return NextResponse.json({
      success: true,
      emailId,
      recipient,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error("========================================");
    console.error("SHIPMENT EMAIL ROUTE EXCEPTION");
    console.error("ERROR:", message);
    console.error("========================================");

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
