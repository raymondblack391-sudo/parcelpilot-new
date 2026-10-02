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
  customerPhone: string;

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
  customerPhone: "",

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

  initialStage: "Picked Up",
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
      if (!form.trackingNumber.trim()) {
        setErrorMessage(
          "Tracking number is required."
        );
        return false;
      }

      if (form.trackingNumber.trim().length < 5) {
        setErrorMessage(
          "Tracking number must contain at least 5 characters."
        );
        return false;
      }

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

      if (!form.customerPhone.trim()) {
        setErrorMessage(
          "Customer phone number is required for SMS notifications."
        );
        return false;
      }

      if (form.customerPhone.trim().length < 7) {
        setErrorMessage(
          "Please enter a valid customer phone number."
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

    let createdShipmentId: string | null = null;

    try {
      const normalizedTrackingNumber =
        form.trackingNumber
          .trim()
          .toUpperCase();

      const {
        data: currentUser,
      } = await supabase.auth.getUser();

      const performedBy =
        currentUser.user?.email ||
        currentUser.user?.id ||
        null;

      const {
        data: existingShipment,
        error: duplicateError,
      } = await supabase
        .from("shipments")
        .select("id")
        .eq(
          "tracking_number",
          normalizedTrackingNumber
        )
        .maybeSingle();

      if (duplicateError) {
        throw new Error(
          `Unable to check tracking number: ${duplicateError.message}`
        );
      }

      if (existingShipment) {
        throw new Error(
          `Tracking number ${normalizedTrackingNumber} already exists.`
        );
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

      const currentLatitude = Number(
        form.currentLatitude
      );

      const currentLongitude = Number(
        form.currentLongitude
      );

      const packageCount = Number(
        form.packageCount
      );

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

      const status =
        getStatusFromStage(
          form.initialStage
        );

      const statusCode =
        getStatusCodeFromStage(
          form.initialStage
        );

      const deliveredAt =
        form.initialStage === "Delivered"
          ? new Date().toISOString()
          : null;

      const deliveredTo =
        form.initialStage === "Delivered"
          ? form.receiverName.trim()
          : null;

      const shipmentPayload = {
        tracking_number:
          normalizedTrackingNumber,

        sender_name:
          form.senderName.trim(),

        receiver_name:
          form.receiverName.trim(),

        sender_address:
          form.senderAddress.trim(),

        receiver_address:
          form.receiverAddress.trim(),

        customer_email:
          form.customerEmail.trim(),

        customer_phone:
          form.customerPhone.trim(),

        origin_country:
          form.originCountry.trim(),

        destination_country:
          form.destinationCountry.trim(),

        origin_airport:
          form.originAirport.trim() ||
          null,

        destination_airport:
          form.destinationAirport.trim() ||
          null,

        origin_latitude:
          originLatitude,

        origin_longitude:
          originLongitude,

        destination_latitude:
          destinationLatitude,

        destination_longitude:
          destinationLongitude,

        current_latitude:
          currentLatitude,

        current_longitude:
          currentLongitude,

        shipping_mode:
          form.shippingMode.trim(),

        service_type:
          form.serviceType.trim(),

        package_weight:
          packageWeight,

        package_length:
          packageLength,

        package_width:
          packageWidth,

        package_height:
          packageHeight,

        package_count:
          packageCount,

        declared_value:
          declaredValue,

        currency:
          form.currency,

        flight_number:
          form.flightNumber.trim() ||
          null,

        awb_number:
          form.awbNumber.trim() ||
          null,

        estimated_delivery_date:
          form.estimatedDeliveryDate ||
          null,

        status,

        status_code:
          statusCode,

        delivered_at:
          deliveredAt,

        delivered_to:
          deliveredTo,

        delivery_location:
          form.initialStage === "Delivered"
            ? form.operationalLocation.trim()
            : null,

        updated_at:
          new Date().toISOString(),
      };

      const {
        data: shipment,
        error: shipmentError,
      } = await supabase
        .from("shipments")
        .insert(shipmentPayload)
        .select()
        .single();

      if (shipmentError || !shipment) {
        throw new Error(
          shipmentError?.message ||
            "Unable to create shipment."
        );
      }

      createdShipmentId = shipment.id;

      /*
       * Save the manually selected starting
       * tracking location.
       */
      const {
        error: locationError,
      } = await supabase
        .from("tracking_locations")
        .insert({
          shipment_id:
            shipment.id,

          latitude:
            currentLatitude,

          longitude:
            currentLongitude,

          recorded_at:
            new Date().toISOString(),
        });

      if (locationError) {
        await supabase
          .from("shipments")
          .delete()
          .eq("id", shipment.id);

        throw new Error(
          `Shipment was not created because the initial tracking location could not be saved: ${locationError.message}`
        );
      }

      /*
       * Create the initial shipment event.
       */
      const eventDescription =
        form.initialTrackingNote.trim() ||
        `Shipment ${form.initialStage.toLowerCase()}.`;

      const {
        error: eventError,
      } = await supabase
        .from("shipment_events")
        .insert({
          shipment_id:
            shipment.id,

          status:
            form.initialStage,

          status_code:
            statusCode,

          description:
            eventDescription,

          location:
            form.operationalLocation.trim(),

          created_at:
            new Date().toISOString(),
        });

      if (eventError) {
        throw new Error(
          `Shipment was created, but the initial shipment event could not be saved: ${eventError.message}`
        );
      }

      /*
       * Create an audit record.
       */
      const {
        error: auditError,
      } = await supabase
        .from("shipment_audit_logs")
        .insert({
          shipment_id:
            shipment.id,

          tracking_number:
            normalizedTrackingNumber,

          action:
            "Shipment Created",

          description:
            `Shipment created at ${form.operationalLocation.trim()} with initial stage ${form.initialStage}.`,

          performed_by:
            performedBy,
        });

      if (auditError) {
        console.error(
          "Audit log error:",
          auditError
        );
      }

      setSuccessMessage(
        `Shipment ${normalizedTrackingNumber} was created successfully.`
      );

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

      if (createdShipmentId) {
        await supabase
          .from("shipments")
          .delete()
          .eq("id", createdShipmentId);
      }

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

                    <input
                      value={
                        form.trackingNumber
                      }
                      onChange={(event) =>
                        updateField(
                          "trackingNumber",
                          event.target.value
                        )
                      }
                      placeholder="Example: PP900002"
                      className={inputClass}
                    />
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
                      by email and SMS.
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

                      <div>
                        <label className={labelClass}>
                          Customer Phone
                        </label>

                        <input
                          type="tel"
                          value={
                            form.customerPhone
                          }
                          onChange={(event) =>
                            updateField(
                              "customerPhone",
                              event.target.value
                            )
                          }
                          placeholder="+237 6XX XXX XXX"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-blue-700">
                      Enter the phone number with the
                      country code when possible.
                    </p>
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
                            "Not entered"}
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