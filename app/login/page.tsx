"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.session) {
      console.error("Login error:", error);
      setError(error?.message || "Unable to sign in.");
      setLoading(false);
      return;
    }

    console.log("Login successful:", data.user.email);

    window.location.href = "/operations";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl lg:grid-cols-2">
          
          <div className="hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-black text-blue-700">
                  P
                </div>

                <div>
                  <p className="text-xl font-bold">
                    ParcelPilot
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                    Logistics
                  </p>
                </div>
              </div>

              <div className="mt-20">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Staff Operations
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight">
                  Control every shipment from one place.
                </h1>

                <p className="mt-5 max-w-md leading-7 text-blue-100">
                  Manage shipments, update delivery stages, monitor
                  customer enquiries, and keep shipment information
                  moving accurately across the network.
                </p>
              </div>
            </div>

            <div className="text-sm text-blue-200">
              Secure Operations Portal
            </div>
          </div>

          <div className="bg-white p-8 text-slate-900 sm:p-10">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">
                  P
                </div>

                <div>
                  <p className="text-xl font-bold text-slate-950">
                    ParcelPilot
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Logistics
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Staff Portal
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-500">
                Sign in to access ParcelPilot operations.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your staff email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In to Operations"}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6 text-center">
              <Link
                href="/"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                ← Return to ParcelPilot website
              </Link>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              ParcelPilot Logistics • Secure Staff Portal
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
