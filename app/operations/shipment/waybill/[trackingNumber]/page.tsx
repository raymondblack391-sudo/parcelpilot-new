"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import JsBarcode from "jsbarcode";
import RequireAuth from "@/app/components/RequireAuth";
import { supabase } from "@/lib/supabase";

const COMPANY = {
  name: "ParcelPilot Logistics",
  email: "support@parcelpilotlogistics.com",
  website: "www.parcelpilotlogistics.com",
  phone: "",
  address: "",
};

type Row = Record<string, string | number | null>;

function Barcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        height: 64,
        width: 2,
        displayValue: false,
        margin: 0,
      });
    } catch {
      // leave the barcode empty if the value cannot be encoded
    }
  }, [value]);
  return <svg ref={ref} />;
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900 whitespace-pre-line">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function formatDate(value: string | number | null | undefined) {
  if (!value) return "—";
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

function WaybillView() {
  const params = useParams<{ trackingNumber: string }>();
  const trackingNumber = decodeURIComponent(String(params?.trackingNumber ?? ""));
  const [row, setRow] = useState<Row | null>(null);
  const [message, setMessage] = useState("Loading waybill...");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", trackingNumber)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setMessage("Shipment not found, or you are not allowed to view it.");
        return;
      }
      setRow(data as Row);
    }
    if (trackingNumber) load();
    return () => {
      cancelled = true;
    };
  }, [trackingNumber]);

  if (!row) {
    return <div className="p-10 text-center text-slate-600">{message}</div>;
  }

  const size =
    row.package_length && row.package_width && row.package_height
      ? `${row.package_length} x ${row.package_width} x ${row.package_height} cm`
      : null;

  return (
    <main className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between print:hidden">
        <a href="/operations/shipment" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          ← Back to shipments
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
        >
          Print / Save as PDF
        </button>
      </div>

      <article className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl font-black text-white">P</div>
            <div>
              <p className="text-xl font-black leading-tight">{COMPANY.name}</p>
              <p className="text-xs text-slate-500">{COMPANY.website}</p>
              <p className="text-xs text-slate-500">{[COMPANY.email, COMPANY.phone].filter(Boolean).join(" · ")}</p>
              {COMPANY.address && <p className="text-xs text-slate-500">{COMPANY.address}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Air Waybill / Shipping Label</p>
            <p className="mt-1 text-2xl font-black tracking-tight">{String(row.tracking_number)}</p>
          </div>
        </header>

        <div className="mt-5 flex justify-center">
          <Barcode value={String(row.tracking_number ?? "")} />
        </div>

        <section className="mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-300 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Shipper (From)</p>
            <p className="mt-2 text-base font-black">{String(row.sender_name ?? "—")}</p>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{String(row.sender_address ?? "")}</p>
            <p className="mt-1 text-sm font-semibold">{String(row.origin_country ?? "")}</p>
          </div>
          <div className="rounded-lg border border-slate-300 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Consignee (To)</p>
            <p className="mt-2 text-base font-black">{String(row.receiver_name ?? "—")}</p>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{String(row.receiver_address ?? "")}</p>
            <p className="mt-1 text-sm font-semibold">{String(row.destination_country ?? "")}</p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-x-6 gap-y-4 rounded-lg border border-slate-300 p-4">
          <Field label="Shipping mode" value={row.shipping_mode} />
          <Field label="Service" value={row.service_type} />
          <Field label="Date created" value={formatDate(row.created_at)} />
          <Field label="Origin airport" value={row.origin_airport} />
          <Field label="Destination airport" value={row.destination_airport} />
          <Field label="Est. delivery" value={formatDate(row.estimated_delivery_date)} />
          <Field label="AWB number" value={row.awb_number} />
          <Field label="Flight number" value={row.flight_number} />
          <Field label="Status" value={row.status} />
        </section>

        <section className="mt-6 grid grid-cols-4 gap-x-6 gap-y-4 rounded-lg border border-slate-300 p-4">
          <Field label="Packages" value={row.package_count} />
          <Field label="Weight" value={row.package_weight ? `${row.package_weight} kg` : null} />
          <Field label="Dimensions" value={size} />
          <Field label="Declared value" value={row.declared_value ? `${row.declared_value} ${row.currency ?? ""}` : null} />
        </section>

        <section className="mt-10 grid grid-cols-2 gap-10">
          <div>
            <div className="h-14 border-b border-slate-400" />
            <p className="mt-1 text-xs text-slate-500">Shipper signature / date</p>
          </div>
          <div>
            <div className="h-14 border-b border-slate-400" />
            <p className="mt-1 text-xs text-slate-500">Receiver signature / date</p>
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] text-slate-500">
          Track this shipment at {COMPANY.website}/track/{String(row.tracking_number)}
        </p>
      </article>
    </main>
  );
}

export default function WaybillPage() {
  return (
    <RequireAuth>
      <WaybillView />
    </RequireAuth>
  );
}
