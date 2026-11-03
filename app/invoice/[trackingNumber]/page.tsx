"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const COMPANY = {
  name: "ParcelPilot Logistics",
  email: "support@parcelpilotlogistics.com",
  website: "www.parcelpilotlogistics.com",
  phone: "",
  address: "",
};

type Invoice = {
  number: string;
  date: string | null;
  trackingNumber: string;
  status: string | null;
  senderName: string | null;
  senderAddress: string | null;
  receiverName: string | null;
  receiverAddress: string | null;
  originCountry: string | null;
  destinationCountry: string | null;
  shippingMode: string | null;
  serviceType: string | null;
  packageCount: number | null;
  packageWeight: number | null;
  awbNumber: string | null;
  flightNumber: string | null;
  estimatedDelivery: string | null;
};

function dateText(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="w-1/3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
        {value === null || value === undefined || value === "" ? "—" : value}
      </td>
    </tr>
  );
}

export default function InvoicePage() {
  const params = useParams<{ trackingNumber: string }>();
  const trackingNumber = decodeURIComponent(String(params?.trackingNumber ?? "")).trim();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Unable to load the invoice.");
      } else {
        setInvoice(data.invoice as Invoice);
      }
    } catch {
      setError("Unable to load the invoice. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!invoice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{COMPANY.name}</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">View your invoice</h1>
          <p className="mt-2 text-sm text-slate-600">
            Shipment <span className="font-bold">{trackingNumber}</span>. Enter the email address used for this
            shipment to continue.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && email && !busy) submit();
            }}
            placeholder="you@example.com"
            className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={busy || !email}
            className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {busy ? "Checking..." : "View invoice"}
          </button>
          <a href={`/track/${encodeURIComponent(trackingNumber)}`} className="mt-4 block text-center text-sm font-semibold text-slate-500 hover:text-slate-800">
            ← Back to tracking
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between print:hidden">
        <a href={`/track/${encodeURIComponent(invoice.trackingNumber)}`} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          ← Back to tracking
        </a>
        <button type="button" onClick={() => window.print()} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500">
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
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Invoice</p>
            <p className="mt-1 text-2xl font-black tracking-tight">{invoice.number}</p>
            <p className="text-xs text-slate-500">Date: {dateText(invoice.date)}</p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-300 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Sender</p>
            <p className="mt-2 font-black">{invoice.senderName || "—"}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{invoice.senderAddress || ""}</p>
            <p className="mt-1 text-sm font-semibold">{invoice.originCountry || ""}</p>
          </div>
          <div className="rounded-lg border border-slate-300 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Receiver</p>
            <p className="mt-2 font-black">{invoice.receiverName || "—"}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{invoice.receiverAddress || ""}</p>
            <p className="mt-1 text-sm font-semibold">{invoice.destinationCountry || ""}</p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-300">
          <table className="w-full">
            <tbody>
              <Row label="Tracking number" value={invoice.trackingNumber} />
              <Row label="Shipping mode" value={invoice.shippingMode} />
              <Row label="Service" value={invoice.serviceType} />
              <Row label="AWB number" value={invoice.awbNumber} />
              <Row label="Flight number" value={invoice.flightNumber} />
              <Row label="Packages" value={invoice.packageCount} />
              <Row label="Weight" value={invoice.packageWeight ? `${invoice.packageWeight} kg` : null} />
              <Row label="Estimated delivery" value={invoice.estimatedDelivery ? dateText(invoice.estimatedDelivery) : null} />
              <Row label="Status" value={invoice.status} />
            </tbody>
          </table>
        </section>

        <p className="mt-8 text-center text-[11px] text-slate-500">
          Questions about this document? Contact {COMPANY.email}
        </p>
      </article>
    </main>
  );
}
