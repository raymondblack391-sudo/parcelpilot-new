"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import StaffNav from "@/app/components/StaffNav";
import RequireAuth from "@/app/components/RequireAuth";

type FormData = {
  trackingNumber: string;
  senderName: string;
  receiverName: string;
  senderAddress: string;
  receiverAddress: string;
  customerEmail: string;

  originCountry: string;
  originCity: string;
  originAirport: string;
  originLatitude: string;
  originLongitude: string;

  destinationCountry: string;
  destinationCity: string;
  destinationAirport: string;
  destinationLatitude: string;
  destinationLongitude: string;

  shippingMode: string;
  serviceType: string;
  flightNumber: string;
  awbNumber: string;
  estimatedDeliveryDate: string;

  packageCount: string;
  packageWeight: string;
  packageLength: string;
  packageWidth: string;
  packageHeight: string;

  declaredValue: string;
  currency: string;

  initialStage: string;
  operationalLocation: string;
  currentLatitude: string;
  currentLongitude: string;
  initialTrackingNote: string;
};

const stages = [
  {
    name: "Picked Up",
    code: "PICKED_UP",
  },
  {
    name: "Origin Facility",
    code: "ORIGIN_FACILITY",
  },
  {
    name: "Origin Airport",
    code: "ORIGIN_AIRPORT",
  },
  {
    name: "In Flight",
    code: "IN_FLIGHT",
  },
  {
    name: "Destination Airport",
    code: "DESTINATION_AIRPORT",
  },
  {
    name: "Customs Clearance",
    code: "CUSTOMS_CLEARANCE",
  },
  {
    name: "Customs Released",
    code: "CUSTOMS_RELEASED",
  },
  {
    name: "Destination Facility",
    code: "DESTINATION_FACILITY",
  },
  {
    name: "Out for Delivery",
    code: "OUT_FOR_DELIVERY",
  },
  {
    name: "Delivered",
    code: "DELIVERED",
  },
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100";

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-800";

const initialForm: FormData = {
  trackingNumber: "",
  senderName: "",
  receiverName: "",
  senderAddress: "",
  receiverAddress: "",
  customerEmail: "",

  originCountry: "",
  originCity: "",
  originAirport: "",
  originLatitude: "",
  originLongitude: "",

  destinationCountry: "",
  destinationCity: "",
  destinationAirport: "",
  destinationLatitude: "",
  destinationLongitude: "",

  shippingMode: "Air Freight",
  serviceType: "Express Air",
  flightNumber: "",
  awbNumber: "",
  estimatedDeliveryDate: "",

  packageCount: "1",
  packageWeight: "",
  packageLength: "",
  packageWidth: "",
  packageHeight: "",

  declaredValue: "",
  currency: "EUR",

  initialStage: "Origin Airport",
  operationalLocation: "",
  currentLatitude: "",
  currentLongitude: "",
  initialTrackingNote: "",
};

function getStatusFromStage(stage: string) {
  if (stage === "Delivered") {
    return "Delivered";
  }

  if (stage === "Out for Delivery") {
    return "Out for Delivery";
  }

  if (
    stage === "Destination Facility" ||
    stage === "Customs Released" ||
    stage === "Customs Clearance" ||
    stage === "Destination Airport"
  ) {
    return "In Transit";
  }

  if (stage === "In Flight") {
    return "In Flight";
  }

  return "In Transit";
}

function getStatusCodeFromStage(stage: string) {
  const found = stages.find(
    (item) => item.name === stage
  );

  return found?.code || "PICKED_UP";
}

function isValidCoordinate(
  latitude: number,
  longitude: number
) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

function isPositiveNumber(value: string) {
  if (!value.trim()) {
    return true;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

export default function CreateShipmentPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] =
    useState<FormData>(initialForm);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  function updateField(
    field: keyof FormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function validateStep(currentStep: number) {
    setErrorMessage("");

    if (currentStep === 1) {
      // Tracking numbers are generated automatically when the shipment is created.

      if (!form.senderName.trim()) {
        setErrorMessage(
          "Sender name is required."
        );
        return false;
      }

      if (!form.receiverName.trim()) {
        setErrorMessage(
          "Receiver name is required."
        );
        return false;
      }

      if (!form.senderAddress.trim()) {
        setErrorMessage(
          "Sender address is required."
        );
        return false;
      }

      if (!form.receiverAddress.trim()) {
        setErrorMessage(
          "Receiver address is required."
        );
        return false;
      }

      if (!form.customerEmail.trim()) {
        setErrorMessage(
          "Customer email is required for shipment notifications."
        );
        return false;
      }

      if (!isValidEmail(form.customerEmail)) {
        setErrorMessage(
          "Please enter a valid customer email address."
        );
        return false;
      }
    }

    if (currentStep === 2) {
      if (!form.originCountry.trim()) {
        setErrorMessage(
          "Origin country is required."
        );
        return false;
      }

      if (!form.originCity.trim()) {
        setErrorMessage(
          "Origin city is required."
        );
        return false;
      }

      if (!form.destinationCountry.trim()) {
        setErrorMessage(
          "Destination country is required."
        );
        return false;
      }

      if (!form.destinationCity.trim()) {
        setErrorMessage(
          "Destination city is required."
        );
        return false;
      }

      if (!form.originLatitude.trim()) {
        setErrorMessage(
          "Origin latitude is required."
        );
        return false;
      }

      if (!form.originLongitude.trim()) {
        setErrorMessage(
          "Origin longitude is required."
        );
        return false;
      }

      if (!form.destinationLatitude.trim()) {
        setErrorMessage(
          "Destination latitude is required."
        );
        return false;
      }

      if (!form.destinationLongitude.trim()) {
        setErrorMessage(
          "Destination longitude is required."
        );
        return false;
      }

      const originLatitude = Number(
        form.originLatitude
      );

      const originLongitude = Number(
        form.originLongitude
      );

      const destinationLatitude = Number(
        form.destinationLatitude
      );

      const destinationLongitude = Number(
        form.destinationLongitude
      );

      if (
        !isValidCoordinate(
          originLatitude,
          originLongitude
        )
      ) {
        setErrorMessage(
          "Please enter valid origin coordinates."
        );
        return false;
      }

      if (
        !isValidCoordinate(
          destinationLatitude,
          destinationLongitude
        )
      ) {
        setErrorMessage(
          "Please enter valid destination coordinates."
        );
        return false;
      }
    }

    if (currentStep === 3) {
      if (!form.packageCount.trim()) {
        setErrorMessage(
          "Package count is required."
        );
        return false;
      }

      const packageCount = Number(
        form.packageCount
      );

      if (
        !Number.isFinite(packageCount) ||
        packageCount < 1
      ) {
        setErrorMessage(
          "Package count must be at least 1."
        );
        return false;
      }

      if (!form.packageWeight.trim()) {
        setErrorMessage(
          "Package weight is required."
        );
        return false;
      }

      if (!isPositiveNumber(form.packageWeight)) {
        setErrorMessage(
          "Package weight must be a valid positive number."
        );
        return false;
      }

      if (!isPositiveNumber(form.packageLength)) {
        setErrorMessage(
          "Package length must be a valid number."
        );
        return false;
      }

      if (!isPositiveNumber(form.packageWidth)) {
        setErrorMessage(
          "Package width must be a valid number."
        );
        return false;
      }

      if (!isPositiveNumber(form.packageHeight)) {
        setErrorMessage(
          "Package height must be a valid number."
        );
        return false;
      }

      if (!isPositiveNumber(form.declaredValue)) {
        setErrorMessage(
          "Declared value must be a valid number."
        );
        return false;
      }

      if (!form.shippingMode.trim()) {
        setErrorMessage(
          "Shipping mode is required."
        );
        return false;
      }

      if (!form.serviceType.trim()) {
        setErrorMessage(
          "Service type is required."
        );
        return false;
      }
    }

    if (currentStep === 4) {
      if (!form.initialStage.trim()) {
        setErrorMessage(
          "Initial shipment stage is required."
        );
        return false;
      }

      /*
       * Air shipments start at their origin airport.
       * The origin coordinates collected in Step 2 become
       * the initial tracking coordinates automatically.
       */
      if (
        form.shippingMode === "Air Freight" &&
        form.originLatitude.trim() &&
        form.originLongitude.trim()
      ) {
        const originLatitude = Number(
          form.originLatitude
        );

        const originLongitude = Number(
          form.originLongitude
        );

        if (
          isValidCoordinate(
            originLatitude,
            originLongitude
          )
        ) {
          if (!form.currentLatitude.trim()) {
            setForm((previous) => ({
              ...previous,
              currentLatitude:
                previous.originLatitude,
              currentLongitude:
                previous.originLongitude,
              operationalLocation:
                previous.operationalLocation.trim() ||
                previous.originAirport.trim() ||
                `${previous.originCity}, ${previous.originCountry}`,
            }));
          }
        }
      }

      if (!form.operationalLocation.trim()) {
        setErrorMessage(
          "Operational location is required."
        );
        return false;
      }

      if (!form.currentLatitude.trim()) {
        setErrorMessage(
          "Current latitude is required."
        );
        return false;
      }

      if (!form.currentLongitude.trim()) {
        setErrorMessage(
          "Current longitude is required."
        );
        return false;
      }

      const latitude = Number(
        form.currentLatitude
      );

      const longitude = Number(
        form.currentLongitude
      );

      if (!isValidCoordinate(latitude, longitude)) {
        setErrorMessage(
          "Please enter valid current coordinates."
        );
        return false;
      }

      if (
        form.initialStage === "Delivered" &&
        !form.initialTrackingNote.trim()
      ) {
        setErrorMessage(
          "Please add a delivery note when creating a Delivered shipment."
        );
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(step)) {
      return;
    }

    if (step < 4) {
      setStep((previous) => previous + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function previousStep() {
    setErrorMessage("");
    setSuccessMessage("");

    if (step > 1) {
      setStep((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  async function createShipment() {
    if (!validateStep(4)) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const originLatitude = Number(
        form.originLatitude
      );

      const originLongitude = Number(
        form.originLongitude
      );

      const destinationLatitude = Number(
        form.destinationLatitude
      );

      const destinationLongitude = Number(
        form.destinationLongitude
      );

      const currentLatitude =
        form.shippingMode === "Air Freight"
          ? originLatitude
          : Number(form.currentLatitude);

      const currentLongitude =
        form.shippingMode === "Air Freight"
          ? originLongitude
          : Number(form.currentLongitude);

      const packageCount = Number(form.packageCount);

      const packageWeight = form.packageWeight
        ? Number(form.packageWeight)
        : null;

      const packageLength = form.packageLength
        ? Number(form.packageLength)
        : null;

      const packageWidth = form.packageWidth
        ? Number(form.packageWidth)
        : null;

      const packageHeight = form.packageHeight
        ? Number(form.packageHeight)
        : null;

      const declaredValue = form.declaredValue
        ? Number(form.declaredValue)
        : null;

      const status = getStatusFromStage(form.initialStage);

      const statusCode = getStatusCodeFromStage(form.initialStage);

      const deliveredAt =
        form.initialStage === "Delivered"
          ? new Date().toISOString()
          : null;

      const deliveredTo =
        form.initialStage === "Delivered"
          ? form.receiverName.trim()
          : null;

      const shipmentPayload = {
        sender_name: form.senderName.trim(),
        receiver_name: form.receiverName.trim(),
        sender_address: form.senderAddress.trim(),
        receiver_address: form.receiverAddress.trim(),
        customer_email: form.customerEmail.trim(),

        origin_country: form.originCountry.trim(),
        destination_country: form.destinationCountry.trim(),

        origin_airport:
          form.originAirport.trim() || null,

        destination_airport:
          form.destinationAirport.trim() || null,

        origin_latitude: originLatitude,
        origin_longitude: originLongitude,

        destination_latitude: destinationLatitude,
        destination_longitude: destinationLongitude,

        current_latitude: currentLatitude,
        current_longitude: currentLongitude,

        shipping_mode: form.shippingMode.trim(),
        service_type: form.serviceType.trim(),

        package_weight: packageWeight,
        package_length: packageLength,
        package_width: packageWidth,
        package_height: packageHeight,
        package_count: packageCount,

        declared_value: declaredValue,
        currency: form.currency,

        flight_number:
          form.flightNumber.trim() || null,

        awb_number:
          form.awbNumber.trim() || null,

        estimated_delivery_date:
          form.estimatedDeliveryDate || null,

        status,
        status_code: statusCode,

        delivered_at: deliveredAt,
        delivered_to: deliveredTo,

        delivery_location:
          form.initialStage === "Delivered"
            ? form.operationalLocation.trim()
            : null,

        updated_at: new Date().toISOString(),
      };

      const {
        data: shipment,
        error: shipmentError,
      } = await supabase.rpc(
        "create_parcelpilot_shipment",
        {
          p_shipment: shipmentPayload,
          p_initial_stage: form.initialStage,
          p_initial_tracking_note:
            form.initialTrackingNote.trim(),
          p_operational_location:
            form.operationalLocation.trim() ||
            form.originAirport.trim() ||
            `${form.originCity.trim()}, ${form.originCountry.trim()}`,
          p_current_latitude: currentLatitude,
          p_current_longitude: currentLongitude,
        }
      );

      if (shipmentError || !shipment) {
        throw new Error(
          shipmentError?.message ||
            "Unable to create shipment."
        );
      }

      /*
       * Send shipment-created email after the database insert succeeds.
       * Email failure must NOT undo the shipment creation.
       *
       * IMPORTANT:
       * Read the response as TEXT first.
       * This prevents browser console output from collapsing
       * useful API errors into an empty "{}".
       */
      try {
        const notificationResponse = await fetch(
          "/api/notifications/shipment-created",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerEmail: form.customerEmail.trim(),
              receiverEmail: form.customerEmail.trim(),
              trackingNumber: shipment.tracking_number,
              senderName: form.senderName.trim(),
              receiverName: form.receiverName.trim(),
              originCountry: form.originCountry.trim(),
              destinationCountry: form.destinationCountry.trim(),
              shippingMode: form.shippingMode,
              serviceType: form.serviceType,
              estimatedDeliveryDate:
                form.estimatedDeliveryDate || "",
            }),
          }
        );

        const rawResponse = await notificationResponse.text();

        console.log(
          "SHIPMENT EMAIL HTTP STATUS:",
          notificationResponse.status
        );

        console.log(
          "SHIPMENT EMAIL RAW RESPONSE:",
          rawResponse
        );

        let notificationData: {
          success?: boolean;
          error?: string;
          errorName?: string | null;
          statusCode?: number | null;
          emailId?: string | null;
          recipient?: string;
        } = {};

        try {
          notificationData = rawResponse
            ? JSON.parse(rawResponse)
            : {};
        } catch {
          notificationData = {
            success: false,
            error: rawResponse || "The email API returned an empty response.",
          };
        }

        if (
          !notificationResponse.ok ||
          notificationData.success !== true
        ) {
          const actualError =
            notificationData.error ||
            notificationData.errorName ||
            rawResponse ||
            `Email API returned HTTP ${notificationResponse.status}.`;

          console.error(
            "SHIPMENT CREATED EMAIL FAILED:",
            actualError
          );

          console.error(
            "SHIPMENT CREATED EMAIL DETAILS:",
            {
              httpStatus: notificationResponse.status,
              response: notificationData,
              rawResponse,
            }
          );

          setErrorMessage(
            `Shipment ${shipment.tracking_number} was created, but the email could not be sent: ${actualError}`
          );
        } else {
          console.log(
            "SHIPMENT CREATED EMAIL SENT:",
            notificationData
          );

          setSuccessMessage(
            `Shipment ${shipment.tracking_number} was created successfully and the notification email was sent.`
          );
        }
      } catch (emailError) {
        const actualError =
          emailError instanceof Error
            ? emailError.message
            : String(emailError);

        console.error(
          "SHIPMENT CREATED EMAIL REQUEST ERROR:",
          actualError
        );

        setErrorMessage(
          `Shipment ${shipment.tracking_number} was created, but the email service could not be reached: ${actualError}`
        );
      }

      setTimeout(() => {
        router.push(
          `/operations/shipment?shipment=${shipment.id}`
        );
      }, 1800);

      setTimeout(() => {
        router.push(
          `/operations/shipment?shipment=${shipment.id}`
        );
      }, 1200);
    } catch (error) {
      console.error(
        "Create shipment error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the shipment.";

      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-slate-100">
        <StaffNav />

        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Operations
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Create New Shipment
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              Create a complete shipment record with
              manually controlled origin, destination and
              initial tracking information.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((number) => (
              <div key={number}>
                <div
                  className={`h-2 rounded-full ${
                    number <= step
                      ? "bg-blue-600"
                      : "bg-slate-300"
                  }`}
                />

                <p
                  className={`mt-2 text-xs font-semibold ${
                    number <= step
                      ? "text-blue-700"
                      : "text-slate-500"
                  }`}
                >
                  Step {number}
                </p>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Shipment Parties & Customer Contact
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the shipment details and the
                    customer's contact information for
                    future notifications.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className={labelClass}>
                      Tracking Number
                    </label>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                      <p className="text-sm font-semibold text-blue-900">
                        Automatically generated
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        ParcelPilot will generate a unique PP###### tracking number when this shipment is created.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Sender Name
                      </label>

                      <input
                        value={
                          form.senderName
                        }
                        onChange={(event) =>
                          updateField(
                            "senderName",
                            event.target.value
                          )
                        }
                        placeholder="ParcelPilot Logistics"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Receiver Name
                      </label>

                      <input
                        value={
                          form.receiverName
                        }
                        onChange={(event) =>
                          updateField(
                            "receiverName",
                            event.target.value
                          )
                        }
                        placeholder="Customer name"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Sender Address
                      </label>

                      <textarea
                        value={
                          form.senderAddress
                        }
                        onChange={(event) =>
                          updateField(
                            "senderAddress",
                            event.target.value
                          )
                        }
                        placeholder="Full sender address"
                        rows={4}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Receiver Address
                      </label>

                      <textarea
                        value={
                          form.receiverAddress
                        }
                        onChange={(event) =>
                          updateField(
                            "receiverAddress",
                            event.target.value
                          )
                        }
                        placeholder="Full receiver address"
                        rows={4}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h3 className="text-lg font-bold text-blue-900">
                      Customer Notifications
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-blue-700">
                      These contact details will be used
                      later to send shipment notifications
                      by email.
                    </p>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Customer Email
                        </label>

                        <input
                          type="email"
                          value={
                            form.customerEmail
                          }
                          onChange={(event) =>
                            updateField(
                              "customerEmail",
                              event.target.value
                            )
                          }
                          placeholder="customer@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Route & Locations
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    All coordinates are entered manually by
                    the ParcelPilot operator.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-5 text-lg font-bold text-slate-900">
                      Origin
                    </h3>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Origin Country
                        </label>

                        <input
                          value={
                            form.originCountry
                          }
                          onChange={(event) =>
                            updateField(
                              "originCountry",
                              event.target.value
                            )
                          }
                          placeholder="Country"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Origin City
                        </label>

                        <input
                          value={
                            form.originCity
                          }
                          onChange={(event) =>
                            updateField(
                              "originCity",
                              event.target.value
                            )
                          }
                          placeholder="City"
                          className={inputClass}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          Origin Airport
                        </label>

                        <input
                          value={
                            form.originAirport
                          }
                          onChange={(event) =>
                            updateField(
                              "originAirport",
                              event.target.value
                            )
                          }
                          placeholder="Airport name or code"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Origin Latitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          value={
                            form.originLatitude
                          }
                          onChange={(event) =>
                            updateField(
                              "originLatitude",
                              event.target.value
                            )
                          }
                          placeholder="Latitude"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Origin Longitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          value={
                            form.originLongitude
                          }
                          onChange={(event) =>
                            updateField(
                              "originLongitude",
                              event.target.value
                            )
                          }
                          placeholder="Longitude"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-5 text-lg font-bold text-slate-900">
                      Destination
                    </h3>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Destination Country
                        </label>

                        <input
                          value={
                            form.destinationCountry
                          }
                          onChange={(event) =>
                            updateField(
                              "destinationCountry",
                              event.target.value
                            )
                          }
                          placeholder="Country"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Destination City
                        </label>

                        <input
                          value={
                            form.destinationCity
                          }
                          onChange={(event) =>
                            updateField(
                              "destinationCity",
                              event.target.value
                            )
                          }
                          placeholder="City"
                          className={inputClass}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          Destination Airport
                        </label>

                        <input
                          value={
                            form.destinationAirport
                          }
                          onChange={(event) =>
                            updateField(
                              "destinationAirport",
                              event.target.value
                            )
                          }
                          placeholder="Airport name or code"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Destination Latitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          value={
                            form.destinationLatitude
                          }
                          onChange={(event) =>
                            updateField(
                              "destinationLatitude",
                              event.target.value
                            )
                          }
                          placeholder="Latitude"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Destination Longitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          value={
                            form.destinationLongitude
                          }
                          onChange={(event) =>
                            updateField(
                              "destinationLongitude",
                              event.target.value
                            )
                          }
                          placeholder="Longitude"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <p className="text-sm font-semibold text-blue-800">
                      Manual location control
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      ParcelPilot will use exactly the
                      coordinates you enter. No device GPS
                      location is used.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Shipment Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Configure transportation, package and
                    commercial information.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Shipping Mode
                    </label>

                    <select
                      value={
                        form.shippingMode
                      }
                      onChange={(event) =>
                        updateField(
                          "shippingMode",
                          event.target.value
                        )
                      }
                      className={selectClass}
                    >
                      <option>
                        Air Freight
                      </option>

                      <option>
                        Road Freight
                      </option>

                      <option>
                        Sea Freight
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Service Type
                    </label>

                    <select
                      value={
                        form.serviceType
                      }
                      onChange={(event) =>
                        updateField(
                          "serviceType",
                          event.target.value
                        )
                      }
                      className={selectClass}
                    >
                      <option>
                        Express Air
                      </option>

                      <option>
                        Standard Air
                      </option>

                      <option>
                        Economy
                      </option>

                      <option>
                        Express Road
                      </option>

                      <option>
                        Standard Road
                      </option>

                      <option>
                        Sea Freight
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Flight Number
                    </label>

                    <input
                      value={
                        form.flightNumber
                      }
                      onChange={(event) =>
                        updateField(
                          "flightNumber",
                          event.target.value
                        )
                      }
                      placeholder="Flight number"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      AWB Number
                    </label>

                    <input
                      value={
                        form.awbNumber
                      }
                      onChange={(event) =>
                        updateField(
                          "awbNumber",
                          event.target.value
                        )
                      }
                      placeholder="Air Waybill number"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Estimated Delivery Date
                    </label>

                    <input
                      type="date"
                      value={
                        form.estimatedDeliveryDate
                      }
                      onChange={(event) =>
                        updateField(
                          "estimatedDeliveryDate",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Package Count
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        form.packageCount
                      }
                      onChange={(event) =>
                        updateField(
                          "packageCount",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Package Weight (kg)
                    </label>

                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        form.packageWeight
                      }
                      onChange={(event) =>
                        updateField(
                          "packageWeight",
                          event.target.value
                        )
                      }
                      placeholder="Weight"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Declared Value
                    </label>

                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        form.declaredValue
                      }
                      onChange={(event) =>
                        updateField(
                          "declaredValue",
                          event.target.value
                        )
                      }
                      placeholder="Declared value"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Currency
                    </label>

                    <select
                      value={
                        form.currency
                      }
                      onChange={(event) =>
                        updateField(
                          "currency",
                          event.target.value
                        )
                      }
                      className={selectClass}
                    >
                      <option value="EUR">
                        EUR
                      </option>

                      <option value="USD">
                        USD
                      </option>

                      <option value="GBP">
                        GBP
                      </option>

                      <option value="CHF">
                        CHF
                      </option>

                      <option value="CAD">
                        CAD
                      </option>

                      <option value="AUD">
                        AUD
                      </option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-5 text-lg font-bold text-slate-900">
                    Package Dimensions
                  </h3>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label className={labelClass}>
                        Length (cm)
                      </label>

                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={
                          form.packageLength
                        }
                        onChange={(event) =>
                          updateField(
                            "packageLength",
                            event.target.value
                          )
                        }
                        placeholder="Length"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Width (cm)
                      </label>

                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={
                          form.packageWidth
                        }
                        onChange={(event) =>
                          updateField(
                            "packageWidth",
                            event.target.value
                          )
                        }
                        placeholder="Width"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Height (cm)
                      </label>

                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={
                          form.packageHeight
                        }
                        onChange={(event) =>
                          updateField(
                            "packageHeight",
                            event.target.value
                          )
                        }
                        placeholder="Height"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Initial Tracking
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Set the shipment's starting stage and
                    manually controlled map location.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className={labelClass}>
                      Initial Stage
                    </label>

                    <select
                      value={
                        form.initialStage
                      }
                      onChange={(event) =>
                        updateField(
                          "initialStage",
                          event.target.value
                        )
                      }
                      className={selectClass}
                    >
                      {stages.map(
                        (stageItem) => (
                          <option
                            key={
                              stageItem.code
                            }
                            value={
                              stageItem.name
                            }
                          >
                            {stageItem.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Operational Location
                    </label>

                    <input
                      value={
                        form.operationalLocation
                      }
                      onChange={(event) =>
                        updateField(
                          "operationalLocation",
                          event.target.value
                        )
                      }
                      placeholder="Enter the location you want displayed"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Current Latitude
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={
                          form.currentLatitude
                        }
                        onChange={(event) =>
                          updateField(
                            "currentLatitude",
                            event.target.value
                          )
                        }
                        placeholder="Enter latitude manually"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Current Longitude
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={
                          form.currentLongitude
                        }
                        onChange={(event) =>
                          updateField(
                            "currentLongitude",
                            event.target.value
                          )
                        }
                        placeholder="Enter longitude manually"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <p className="text-sm font-bold text-blue-900">
                      Operator-controlled location
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-700">
                      The map will start at the exact
                      latitude and longitude you enter above.
                      ParcelPilot does not use your device
                      location.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Initial Tracking Note
                    </label>

                    <textarea
                      value={
                        form.initialTrackingNote
                      }
                      onChange={(event) =>
                        updateField(
                          "initialTrackingNote",
                          event.target.value
                        )
                      }
                      rows={5}
                      placeholder="Describe the initial shipment event..."
                      className={inputClass}
                    />
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h3 className="font-bold text-blue-900">
                      Tracking Preview
                    </h3>

                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-blue-700">
                          Tracking
                        </p>

                        <p className="font-bold text-slate-900">
                          {form.trackingNumber ||
                            "Generated automatically"}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-700">
                          Status
                        </p>

                        <p className="font-bold text-slate-900">
                          {form.initialStage}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-700">
                          Location
                        </p>

                        <p className="font-bold text-slate-900">
                          {form.operationalLocation ||
                            "Not entered"}
                        </p>
                      </div>

                      <div>
                        <p className="text-blue-700">
                          Coordinates
                        </p>

                        <p className="font-bold text-slate-900">
                          {form.currentLatitude &&
                          form.currentLongitude
                            ? `${form.currentLatitude}, ${form.currentLongitude}`
                            : "Not entered"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={
                      previousStep
                    }
                    disabled={saving}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>
                ) : (
                  <Link
                    href="/operations/shipment"
                    className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </Link>
                )}
              </div>

              <div>
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      createShipment
                    }
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Creating Shipment..."
                      : "Create Shipment"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}