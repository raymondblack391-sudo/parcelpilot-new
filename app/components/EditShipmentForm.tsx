"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  trackingNumber: string;
  senderName: string;
  receiverName: string;
  senderAddress: string;
  receiverAddress: string;
  packageWeight: number | null;
  packageCount: number | null;
  serviceType: string;
  estimatedDeliveryDate: string;
};

export default function EditShipmentForm({
  trackingNumber,
  senderName,
  receiverName,
  senderAddress,
  receiverAddress,
  packageWeight,
  packageCount,
  serviceType,
  estimatedDeliveryDate,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    senderName,
    receiverName,
    senderAddress,
    receiverAddress,
    packageWeight:
      packageWeight !== null
        ? String(packageWeight)
        : "",
    packageCount:
      packageCount !== null
        ? String(packageCount)
        : "1",
    serviceType,
    estimatedDeliveryDate:
      estimatedDeliveryDate || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const cleanSenderName = form.senderName.trim();
    const cleanReceiverName = form.receiverName.trim();
    const cleanSenderAddress = form.senderAddress.trim();
    const cleanReceiverAddress =
      form.receiverAddress.trim();
    const cleanServiceType = form.serviceType.trim();

    if (
      !cleanSenderName ||
      !cleanReceiverName ||
      !cleanSenderAddress ||
      !cleanReceiverAddress ||
      !cleanServiceType
    ) {
      setError("Please complete all required fields.");
      setSaving(false);
      return;
    }

    const weight = Number(form.packageWeight);
    const count = Number(form.packageCount);

    if (
      form.packageWeight &&
      (!Number.isFinite(weight) || weight < 0)
    ) {
      setError("Please enter a valid package weight.");
      setSaving(false);
      return;
    }

    if (
      !Number.isInteger(count) ||
      count < 1
    ) {
      setError("Package count must be at least 1.");
      setSaving(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("shipments")
        .update({
          sender_name: cleanSenderName,
          receiver_name: cleanReceiverName,
          sender_address: cleanSenderAddress,
          receiver_address: cleanReceiverAddress,
          package_weight: form.packageWeight
            ? weight
            : null,
          package_count: count,
          service_type: cleanServiceType,
          estimated_delivery_date:
            form.estimatedDeliveryDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq("tracking_number", trackingNumber);

      if (updateError) {
        throw updateError;
      }

      const { data: shipmentRecord, error: shipmentLookupError } =
        await supabase
          .from("shipments")
          .select("id")
          .eq("tracking_number", trackingNumber)
          .single();

      if (shipmentLookupError || !shipmentRecord) {
        throw shipmentLookupError ||
          new Error("Shipment record could not be found.");
      }

      const { error: auditError } = await supabase
        .from("shipment_audit_logs")
        .insert({
          shipment_id: shipmentRecord.id,
          tracking_number: trackingNumber,
          action: "Shipment Edited",
          description:
            "Shipment information was updated by ParcelPilot staff.",
          performed_by: "ParcelPilot Staff",
        });

      if (auditError) {
        throw auditError;
      }

      setMessage(
        "Shipment information updated successfully."
      );

      router.refresh();
    } catch (saveError) {
      console.error(
        "Shipment update failed:",
        saveError
      );

      setError(
        "We could not save the shipment changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Tracking Number
        </p>

        <p className="mt-1 text-xl font-black text-slate-950">
          {trackingNumber}
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Sender Name"
          value={form.senderName}
          onChange={(value) =>
            updateField("senderName", value)
          }
        />

        <Field
          label="Receiver Name"
          value={form.receiverName}
          onChange={(value) =>
            updateField("receiverName", value)
          }
        />

        <Field
          label="Sender Address"
          value={form.senderAddress}
          onChange={(value) =>
            updateField("senderAddress", value)
          }
        />

        <Field
          label="Receiver Address"
          value={form.receiverAddress}
          onChange={(value) =>
            updateField("receiverAddress", value)
          }
        />

        <Field
          label="Package Weight"
          type="number"
          value={form.packageWeight}
          onChange={(value) =>
            updateField("packageWeight", value)
          }
        />

        <Field
          label="Package Count"
          type="number"
          value={form.packageCount}
          onChange={(value) =>
            updateField("packageCount", value)
          }
        />

        <Field
          label="Service Type"
          value={form.serviceType}
          onChange={(value) =>
            updateField("serviceType", value)
          }
        />

        <Field
          label="Estimated Delivery Date"
          type="date"
          value={form.estimatedDeliveryDate}
          onChange={(value) =>
            updateField(
              "estimatedDeliveryDate",
              value
            )
          }
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}
