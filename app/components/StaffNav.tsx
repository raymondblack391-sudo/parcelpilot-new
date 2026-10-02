"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/app/components/LogoutButton";
import { supabase } from "@/lib/supabase";

type StaffRole =
  | "admin"
  | "operations"
  | "support"
  | "readonly";

export default function StaffNav() {
  const [role, setRole] = useState<StaffRole | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const { data: profile } = await supabase
        .from("staff_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!mounted) {
        return;
      }

      setRole(
        (profile?.role as StaffRole | null) ?? null
      );
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, []);

  const canCreateShipment =
    role === "admin" ||
    role === "operations";

  const canViewAudit =
    role === "admin" ||
    role === "operations";

  const isAdmin = role === "admin";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/operations"
            className="text-xl font-bold tracking-tight text-slate-950"
          >
            ParcelPilot
          </Link>

          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Staff Operations
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/operations"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Dashboard
          </Link>

          <Link
            href="/operations/shipment"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Shipments
          </Link>

          {canCreateShipment && (
            <Link
              href="/operations/shipment/create"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Create Shipment
            </Link>
          )}

          <Link
            href="/operations/enquiries"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Enquiries
          </Link>

          {canViewAudit && (
            <Link
              href="/operations/audit"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Audit Log
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/operations/staff"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Staff Management
            </Link>
          )}

          <Link
            href="/track"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Customer Tracking
          </Link>

          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}