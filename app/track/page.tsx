"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

const RECENT_TRACKING_KEY =
  "parcelpilot_recent_tracking";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [error, setError] = useState("");

  const [pasting, setPasting] =
    useState(false);

  const [recentTracking, setRecentTracking] =
    useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        RECENT_TRACKING_KEY
      );

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setRecentTracking(
          parsed
            .filter(
              (item): item is string =>
                typeof item === "string"
            )
            .map((item) =>
              item.trim().toUpperCase()
            )
            .filter(Boolean)
            .slice(0, 5)
        );
      }
    } catch {
      setRecentTracking([]);
    }
  }, []);

  function saveRecentTracking(value: string) {
    const updated = [
      value,
      ...recentTracking.filter(
        (item) => item !== value
      ),
    ].slice(0, 5);

    setRecentTracking(updated);

    try {
      localStorage.setItem(
        RECENT_TRACKING_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // Browser storage may be unavailable.
    }
  }

  function handleTrack(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value = trackingNumber
      .trim()
      .toUpperCase();

    if (!value) {
      setError(
        "Please enter your tracking number."
      );
      return;
    }

    if (value.length < 5) {
      setError(
        "Please enter a valid tracking number."
      );
      return;
    }

    setError("");
    saveRecentTracking(value);

    window.location.href =
      `/track/${encodeURIComponent(value)}`;
  }

  async function handlePaste() {
    setPasting(true);
    setError("");

    try {
      const value =
        await navigator.clipboard.readText();

      const cleaned = value
        .trim()
        .toUpperCase();

      if (!cleaned) {
        setError(
          "No tracking number was found on your clipboard."
        );
        return;
      }

      setTrackingNumber(cleaned);
    } catch {
      setError(
        "Clipboard access is unavailable. Please paste the tracking number manually."
      );
    } finally {
      setPasting(false);
    }
  }

  function selectRecent(value: string) {
    setTrackingNumber(value);
    setError("");
  }

  function clearRecentTracking() {
    setRecentTracking([]);

    try {
      localStorage.removeItem(
        RECENT_TRACKING_KEY
      );
    } catch {
      // Browser storage may be unavailable.
    }
  }

  function useExample() {
    setTrackingNumber("PP900002");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20">
              PP
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">
                ParcelPilot
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                Logistics
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
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

            <Link
              href="/track"
              className="rounded-lg bg-orange-500 px-4 py-2 text-white shadow-lg shadow-orange-500/20"
            >
              Track Shipment
            </Link>
          </nav>

          <Link
            href="/contact"
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-orange-500 hover:text-orange-400 md:hidden"
          >
            Contact
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              ParcelPilot Tracking
            </div>

            <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Know where your shipment is.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Enter your tracking number to view the
              latest operational status, shipment
              journey, available locations and delivery
              progress.
            </p>

            {/* TRACKING FORM */}
            <form
              onSubmit={handleTrack}
              className="mx-auto mt-10 max-w-4xl"
            >
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black/40">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(event) => {
                        setTrackingNumber(
                          event.target.value.toUpperCase()
                        );
                        setError("");
                      }}
                      placeholder="Enter tracking number"
                      aria-label="Tracking number"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-5 text-base font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />

                    {trackingNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          setTrackingNumber("");
                          setError("");
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 transition hover:text-white"
                        aria-label="Clear tracking number"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePaste}
                    disabled={pasting}
                    className="rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 font-bold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pasting
                      ? "Pasting..."
                      : "Paste"}
                  </button>

                  <button
                    type="submit"
                    className="rounded-2xl bg-orange-500 px-8 py-4 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                  >
                    Track Shipment
                  </button>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-400"
                  >
                    {error}
                  </div>
                )}
              </div>
            </form>

            {/* EXAMPLE */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
              <span>Need an example?</span>

              <button
                type="button"
                onClick={useExample}
                className="font-black text-orange-400 transition hover:text-orange-300 hover:underline"
              >
                PP900002
              </button>

              <span>
                Click to enter a sample tracking number.
              </span>
            </div>
          </div>

          {/* TRUST STRIP */}
          <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                  ✓
                </div>

                <div>
                  <p className="font-black">
                    Shipment Status
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current operational stage
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  ●
                </div>

                <div>
                  <p className="font-black">
                    Shipment Location
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Available operational coordinates
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  →
                </div>

                <div>
                  <p className="font-black">
                    Delivery Progress
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Origin to final destination
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT TRACKING */}
      {recentTracking.length > 0 && (
        <section className="border-b border-slate-800 bg-slate-900/50 px-5 py-8 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                  Recent Searches
                </p>

                <h2 className="mt-1 text-lg font-black text-white">
                  Your recent tracking numbers
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Stored only in this browser.
                </p>
              </div>

              <button
                type="button"
                onClick={clearRecentTracking}
                className="w-fit text-xs font-bold text-slate-500 transition hover:text-red-400"
              >
                Clear history
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {recentTracking.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    selectRecent(value)
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-black text-orange-400 transition hover:border-orange-500/50 hover:bg-slate-800"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 px-5 py-16 text-slate-900 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
              Simple Tracking
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Follow your shipment in three steps
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              ParcelPilot gives customers a clear view of
              available shipment information from tracking
              number to delivery.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-sm font-black text-orange-600">
                01
              </div>

              <h3 className="mt-6 text-xl font-black">
                Enter your number
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Enter the tracking number provided for
                your shipment or paste it directly from
                your clipboard.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-blue-600">
                02
              </div>

              <h3 className="mt-6 text-xl font-black">
                View shipment status
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                See the latest operational stage, tracking
                notes and available shipment updates.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-black text-emerald-600">
                03
              </div>

              <h3 className="mt-6 text-xl font-black">
                Follow the journey
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Follow available operational locations,
                route points and delivery progress from
                origin to destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                ParcelPilot Tracking
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Everything you need to understand a shipment.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
                Each shipment tracking page brings together
                the information available for that shipment in
                one place.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Current shipment status",
                  "Operational tracking locations",
                  "Shipment progress timeline",
                  "Origin and destination details",
                  "Package and service information",
                  "Tracking history and notes",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-600">
                      ✓
                    </span>

                    <span className="text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-2xl sm:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 font-black">
                  PP
                </div>

                <div>
                  <p className="font-black">
                    ParcelPilot Logistics
                  </p>

                  <p className="text-xs text-slate-500">
                    Shipment Tracking
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Tracking Number
                </p>

                <p className="mt-2 text-2xl font-black text-white">
                  PP900002
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />

                  <span className="text-sm font-bold text-blue-400">
                    Live shipment updates
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-900 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </p>

                  <p className="mt-2 text-sm font-black">
                    Available
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Progress
                  </p>

                  <p className="mt-2 text-sm font-black">
                    Tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="bg-slate-50 px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl font-black text-orange-600">
            ?
          </div>

          <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
            Need help with a shipment?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
            If you have a question about your shipment or
            tracking information, our support team can help.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
          >
            Contact ParcelPilot
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 px-5 py-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 font-black">
              PP
            </div>

            <div>
              <p className="font-black">
                ParcelPilot Logistics
              </p>

              <p className="mt-1 text-xs text-slate-500">
                International courier and logistics tracking.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-sm">
            <Link
              href="/"
              className="font-semibold text-slate-400 transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/services"
              className="font-semibold text-slate-400 transition hover:text-white"
            >
              Services
            </Link>

            <Link
              href="/about"
              className="font-semibold text-slate-400 transition hover:text-white"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="font-semibold text-slate-400 transition hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} ParcelPilot Logistics. All rights reserved.
        </div>
      </footer>
    </main>
  );
}