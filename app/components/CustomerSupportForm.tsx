"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  trackingNumber: string;
};

export default function CustomerSupportForm({
  trackingNumber,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [statusToken, setStatusToken] = useState("");
  const [supportStatus, setSupportStatus] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (!statusToken) {
      return;
    }

    let cancelled = false;

    async function loadSupportStatus() {
      setCheckingStatus(true);

      const { data, error: statusError } = await supabase.rpc(
        "get_customer_enquiry_status",
        {
          p_status_token: statusToken,
        }
      );

      if (!cancelled) {
        if (statusError) {
          console.error(
            "Customer enquiry status lookup failed:",
            statusError
          );
        } else if (data) {
          setSupportStatus(data);
        }

        setCheckingStatus(false);
      }
    }

    loadSupportStatus();

    const interval = window.setInterval(loadSupportStatus, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [statusToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setSuccess("");
    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      setError("Please complete all fields.");
      setSubmitting(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase.rpc(
        "submit_customer_enquiry",
        {
          p_full_name: cleanName,
          p_email: cleanEmail,
          p_tracking_number: trackingNumber,
          p_subject: cleanSubject,
          p_message: cleanMessage,
        }
      );

      if (insertError) {
        throw insertError;
      }

      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");

      if (data) {
        setStatusToken(data);
      }

      setSuccess(
        "Your enquiry has been submitted successfully. Our support team will review it shortly."
      );
    } catch (submitError) {
      console.error("Customer enquiry submission failed:", submitError);

      setError(
        "We could not submit your enquiry right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-slate-200 bg-white px-5 py-14 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
            Customer Support
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Need Help With This Shipment?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Send our support team a message about your shipment and we will
            review your enquiry.
          </p>

          <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600">
            Tracking number:
            <span className="ml-2 text-orange-600">
              {trackingNumber}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="support-name"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Full Name
              </label>

              <input
                id="support-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label
                htmlFor="support-email"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Email Address
              </label>

              <input
                id="support-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="support-subject"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Subject
            </label>

            <input
              id="support-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="What do you need help with?"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="support-message"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Message
            </label>

            <textarea
              id="support-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe the issue or question..."
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {success}
            </div>
          )}

          {statusToken && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Support Status
                  </p>

                  <p className="mt-2 text-lg font-black text-slate-950">
                    {checkingStatus && !supportStatus
                      ? "Checking status..."
                      : supportStatus || "New"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {supportStatus === "Resolved"
                      ? "Your enquiry has been resolved."
                      : supportStatus === "In Progress"
                      ? "Our support team is currently handling your enquiry."
                      : "Your enquiry has been received by our support team."}
                  </p>
                </div>

                <div
                  className={`inline-flex w-fit items-center rounded-full px-3 py-2 text-xs font-black ${
                    supportStatus === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : supportStatus === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {supportStatus || "New"}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
