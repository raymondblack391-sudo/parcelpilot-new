"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your message.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        full_name: fullName.trim(),
        email: email.trim(),
        tracking_number: trackingNumber.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      });

    if (insertError) {
      console.error(insertError);
      setError(
        "We could not send your message. Please try again."
      );
      setSubmitting(false);
      return;
    }

    setFullName("");
    setEmail("");
    setTrackingNumber("");
    setSubject("");
    setMessage("");

    setSuccess(true);
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20">
              P
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-white">
                ParcelPilot
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-orange-400">
                Logistics
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link
              href="/"
              className="text-slate-300 transition hover:text-orange-400"
            >
              Home
            </Link>

            <Link
              href="/services"
              className="text-slate-300 transition hover:text-orange-400"
            >
              Services
            </Link>

            <Link
              href="/about"
              className="text-slate-300 transition hover:text-orange-400"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="font-bold text-orange-400"
            >
              Contact
            </Link>

            <Link
              href="/track"
              className="text-slate-300 transition hover:text-orange-400"
            >
              Track Shipment
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-white transition hover:bg-orange-400"
            >
              Staff Portal
            </Link>
          </nav>

          <Link
            href="/track"
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400 md:hidden"
          >
            Track
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(249,115,22,0.22),transparent_38%)]" />

        <div className="absolute -right-32 top-20 h-72 w-72 rounded-full border border-orange-500/10" />
        <div className="absolute -right-20 top-32 h-56 w-56 rounded-full border border-orange-500/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              ParcelPilot Support
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Let&apos;s move your shipment forward.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Questions about a shipment, tracking number or
              logistics service? Send us a message and our support
              team can review your enquiry.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/track"
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                Track a Shipment
              </Link>

              <Link
                href="/services"
                className="rounded-xl border border-slate-700 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-white/10"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT STRIP */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-7 sm:grid-cols-3 lg:px-8">
          <SupportStrip
            number="01"
            title="Shipment Support"
            text="Questions about your shipment journey."
          />

          <SupportStrip
            number="02"
            title="Tracking Assistance"
            text="Include your tracking number when available."
          />

          <SupportStrip
            number="03"
            title="Service Enquiries"
            text="Ask about available logistics services."
          />
        </div>
      </section>

      {/* MAIN CONTACT AREA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* LEFT */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Customer Support
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              How can we help?
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              ParcelPilot helps customers understand their shipment
              journey, published operational updates and available
              logistics information.
            </p>

            <div className="mt-10 space-y-4">
              <ContactInfo
                icon="📦"
                title="Shipment Questions"
                text="Ask about shipment progress, delivery stages or tracking information."
              />

              <ContactInfo
                icon="📍"
                title="Tracking Support"
                text="Include your tracking number so our team can identify the relevant shipment."
              />

              <ContactInfo
                icon="🚚"
                title="Logistics Services"
                text="Contact us about courier, express, air, road, rail and international logistics."
              />
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
              <div className="p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                    ↗
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
                      Already have a tracking number?
                    </p>

                    <p className="mt-1 font-bold text-white">
                      Check your shipment directly.
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-400">
                  View your shipment status, published location,
                  journey and available tracking history without
                  submitting a support enquiry.
                </p>

                <Link
                  href="/track"
                  className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
                >
                  Track Shipment →
                </Link>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
            <div className="mb-8 border-b border-slate-100 pb-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                    Send an Enquiry
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    Contact our team
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                    Complete the form below and your message will be
                    securely submitted to the ParcelPilot support
                    system.
                  </p>
                </div>

                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-xl sm:flex">
                  ✉
                </div>
              </div>
            </div>

            {success && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                    ✓
                  </div>

                  <div>
                    <p className="font-bold text-emerald-800">
                      Message received.
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      Thank you for contacting ParcelPilot. Your
                      enquiry has been submitted successfully.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                    !
                  </div>

                  <p className="pt-1 text-sm font-semibold leading-6 text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField label="Full Name" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Your full name"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Email Address" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    className="form-input"
                  />
                </FormField>
              </div>

              <FormField label="Tracking Number">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(event) =>
                    setTrackingNumber(event.target.value)
                  }
                  placeholder="Example: PP900002"
                  className="form-input"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Optional. Include your tracking number if your
                  enquiry concerns a shipment.
                </p>
              </FormField>

              <FormField label="Subject" required>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder="How can we help?"
                  className="form-input"
                />
              </FormField>

              <FormField label="Message" required>
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Write your message here..."
                  rows={7}
                  className="form-input resize-none"
                />
              </FormField>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-sm">🔒</div>

                  <p className="text-xs leading-5 text-slate-500">
                    Your enquiry is securely submitted to the
                    ParcelPilot support system. Please do not include
                    passwords or other sensitive account information.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-orange-500 px-6 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Sending Message..."
                  : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              ParcelPilot Resources
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Looking for something else?
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <QuickLink
              href="/track"
              icon="📍"
              title="Track a Shipment"
              text="Check your shipment status and latest available location."
            />

            <QuickLink
              href="/services"
              icon="🚚"
              title="Explore Services"
              text="Learn more about ParcelPilot logistics services."
            />

            <QuickLink
              href="/about"
              icon="✈️"
              title="About ParcelPilot"
              text="Learn more about our logistics platform and approach."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <div className="text-2xl font-black">
                <span className="text-white">Parcel</span>
                <span className="text-orange-500">Pilot</span>
              </div>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                International courier, express and logistics
                tracking with operator-published shipment updates.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Navigation
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/"
                  className="transition hover:text-orange-400"
                >
                  Home
                </Link>

                <Link
                  href="/services"
                  className="transition hover:text-orange-400"
                >
                  Services
                </Link>

                <Link
                  href="/about"
                  className="transition hover:text-orange-400"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="transition hover:text-orange-400"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Tracking
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/track"
                  className="transition hover:text-orange-400"
                >
                  Track Shipment
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-orange-400"
                >
                  Staff Portal
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
            © {new Date().getFullYear()} ParcelPilot Logistics
          </div>
        </div>
      </footer>
    </main>
  );
}

function ContactInfo({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl transition group-hover:bg-orange-500">
        {icon}
      </div>

      <div>
        <h3 className="font-black">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}

function SupportStrip({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-orange-400">
        {number}
      </div>

      <div>
        <p className="font-black text-slate-900">{title}</p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-orange-500">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

function QuickLink({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl transition group-hover:bg-orange-500">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

      <p className="mt-4 text-sm font-bold text-orange-500">
        Learn more →
      </p>
    </Link>
  );
}