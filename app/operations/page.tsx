"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import RequireAuth from "@/app/components/RequireAuth";
import StaffNav from "@/app/components/StaffNav";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: string;
  tracking_number: string;
  sender_name: string | null;
  receiver_name: string | null;
  sender_address: string | null;
  receiver_address: string | null;
  status: string | null;
  status_code: string | null;
  shipping_mode: string | null;
  service_type: string | null;
  package_count: number | null;
  package_weight: number | null;
  currency: string | null;
  origin_country: string | null;
  destination_country: string | null;
  estimated_delivery_date: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  updated_at: string | null;
  created_at: string | null;
};

type ShipmentEvent = {
  id: string;
  shipment_id: string;
  status: string | null;
  status_code: string | null;
  description: string | null;
  location: string | null;
  created_at: string;
};

type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  tracking_number: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

type AuditLog = {
  id: string;
  tracking_number: string;
  action: string;
  description: string;
  performed_by: string | null;
  created_at: string;
};

const STAGES = [
  "Picked Up",
  "Origin Facility",
  "Origin Airport",
  "In Transit",
  "Destination Airport",
  "Customs Clearance",
  "Customs Released",
  "Destination Facility",
  "Out for Delivery",
  "Delivered",
];

function getStatusClass(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "delivered") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    value.includes("customs") ||
    value.includes("airport")
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    value.includes("transit") ||
    value.includes("flight") ||
    value.includes("out for delivery")
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    value.includes("exception") ||
    value.includes("failed") ||
    value.includes("cancel")
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

function formatWeight(
  weight: number | null,
  currency: string | null
) {
  if (weight === null || weight === undefined) {
    return "Not available";
  }

  return `${weight} kg`;
}

function getProgressIndex(status: string | null) {
  const index = STAGES.findIndex(
    (stage) =>
      stage.toLowerCase() ===
      (status || "").toLowerCase()
  );

  return index === -1 ? 0 : index;
}

function OperationsDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [enquiries, setEnquiries] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [staffRole, setStaffRole] = useState<
    "admin" | "operations" | "support" | "readonly" | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function loadStaffRole() {
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

      setStaffRole(
        (profile?.role as
          | "admin"
          | "operations"
          | "support"
          | "readonly"
          | null) ?? null
      );
    }

    loadStaffRole();

    return () => {
      mounted = false;
    };
  }, []);

  const canCreateShipment =
    staffRole === "admin" ||
    staffRole === "operations";

  const isAdmin = staffRole === "admin";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState<string>("");

  const loadDashboard = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true);
        }

        const [
          shipmentsResponse,
          eventsResponse,
          enquiriesResponse,
          auditResponse,
        ] = await Promise.all([
          supabase
            .from("shipments")
            .select("*")
            .order("updated_at", {
              ascending: false,
            }),

          supabase
            .from("shipment_events")
            .select("*")
            .order("created_at", {
              ascending: false,
            })
            .limit(30),

          supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", {
              ascending: false,
            })
            .limit(20),

          supabase
            .from("shipment_audit_logs")
            .select(
              "id, tracking_number, action, description, performed_by, created_at"
            )
            .order("created_at", {
              ascending: false,
            })
            .limit(6),
        ]);

        if (shipmentsResponse.error) {
          console.error(
            "Shipment loading error:",
            shipmentsResponse.error
          );
        }

        if (eventsResponse.error) {
          console.error(
            "Event loading error:",
            eventsResponse.error
          );
        }

        if (enquiriesResponse.error) {
          console.error(
            "Enquiry loading error:",
            enquiriesResponse.error
          );
        }

        if (auditResponse.error) {
          console.error(
            "Audit loading error:",
            auditResponse.error
          );
        }

        setShipments(
          (shipmentsResponse.data || []) as Shipment[]
        );

        setEvents(
          (eventsResponse.data || []) as ShipmentEvent[]
        );

        setEnquiries(
          (enquiriesResponse.data || []) as ContactMessage[]
        );

        setAuditLogs(
          (auditResponse.data || []) as AuditLog[]
        );

        setLastUpdated(
          new Date().toLocaleTimeString()
        );
      } catch (error) {
        console.error(
          "Dashboard loading failed:",
          error
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();

    const channel = supabase
      .channel("operations-dashboard-live")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipments",
        },
        () => {
          loadDashboard();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipment_events",
        },
        () => {
          loadDashboard();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contact_messages",
        },
        () => {
          loadDashboard();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipment_audit_logs",
        },
        () => {
          loadDashboard();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard]);

  const totalShipments = shipments.length;

  const deliveredCount = shipments.filter(
    (shipment) =>
      (shipment.status || "").toLowerCase() ===
      "delivered"
  ).length;

  const activeCount =
    totalShipments - deliveredCount;

  const inTransitCount = shipments.filter(
    (shipment) => {
      const status = (
        shipment.status || ""
      ).toLowerCase();

      return (
        status.includes("transit") ||
        status === "in flight" ||
        status === "out for delivery"
      );
    }
  ).length;

  const exceptionsCount = shipments.filter(
    (shipment) => {
      const status = (
        shipment.status || ""
      ).toLowerCase();

      return (
        status.includes("exception") ||
        status.includes("failed") ||
        status.includes("cancel")
      );
    }
  ).length;

  const newEnquiriesCount = enquiries.filter(
    (item) => item.status === "New"
  ).length;

  const filteredShipments = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return shipments;
    }

    return shipments.filter((shipment) =>
      [
        shipment.tracking_number,
        shipment.sender_name,
        shipment.receiver_name,
        shipment.origin_country,
        shipment.destination_country,
        shipment.status,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        )
    );
  }, [search, shipments]);

  const recentShipments =
    filteredShipments.slice(0, 8);

  const recentEvents = events.slice(0, 8);

  const recentEnquiries =
    enquiries.slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <StaffNav />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                ParcelPilot Logistics
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Operations Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Monitor shipments, operational activity,
                customer enquiries and live tracking
                updates from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  loadDashboard(true)
                }
                disabled={refreshing}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing
                  ? "Refreshing..."
                  : "Refresh Dashboard"}
              </button>

              {canCreateShipment && (
                <Link
                  href="/operations/shipment/create"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Create Shipment
                </Link>
              )}
            </div>
          </div>

          {lastUpdated && (
            <p className="mt-4 text-xs text-slate-500">
              Dashboard last updated at{" "}
              {lastUpdated}
            </p>
          )}
        </section>

        {isAdmin && (
          <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Administration
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Admin Control Center
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Manage staff roles and internal access.
                </p>
              </div>

              <a
                href="/operations/staff"
                className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Manage Staff
              </a>
            </div>
          </section>
        )}

        {/* KPI Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Shipments
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {totalShipments}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              All shipments in the system
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">
              In Transit
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-950">
              {inTransitCount}
            </p>

            <p className="mt-2 text-xs text-blue-700">
              Active movement
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">
              Delivered
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-950">
              {deliveredCount}
            </p>

            <p className="mt-2 text-xs text-emerald-700">
              Completed deliveries
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">
              Active
            </p>

            <p className="mt-3 text-3xl font-bold text-amber-950">
              {activeCount}
            </p>

            <p className="mt-2 text-xs text-amber-700">
              Not yet delivered
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">
              Exceptions
            </p>

            <p className="mt-3 text-3xl font-bold text-red-950">
              {exceptionsCount}
            </p>

            <p className="mt-2 text-xs text-red-700">
              Requires attention
            </p>
          </div>
        </section>

        {/* Main Grid */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Fleet Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Fleet Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest shipment activity across
                    ParcelPilot.
                  </p>
                </div>

                <Link
                  href="/operations/shipment"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage shipments →
                </Link>
              </div>

              <div className="mt-5">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tracking number, sender, receiver or status..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading shipment operations...
                </div>
              ) : recentShipments.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-semibold text-slate-700">
                    No shipments found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Try another search or create a
                    shipment.
                  </p>
                </div>
              ) : (
                recentShipments.map(
                  (shipment) => {
                    const progress =
                      getProgressIndex(
                        shipment.status
                      );

                    return (
                      <div
                        key={shipment.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => {
                          window.location.href =
                            `/operations/shipment?shipment=${encodeURIComponent(
                              shipment.id
                            )}`;
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            window.location.href =
                              `/operations/shipment?shipment=${encodeURIComponent(
                                shipment.id
                              )}`;
                          }
                        }}
                        className="block cursor-pointer p-5 transition hover:bg-slate-50"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-bold text-slate-950">
                                {
                                  shipment.tracking_number
                                }
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(
                                  shipment.status
                                )}`}
                              >
                                {shipment.status ||
                                  "Unknown"}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                              <span>
                                From{" "}
                                <strong className="text-slate-800">
                                  {shipment.origin_country ||
                                    "Unknown"}
                                </strong>
                              </span>

                              <span>
                                To{" "}
                                <strong className="text-slate-800">
                                  {shipment.destination_country ||
                                    "Unknown"}
                                </strong>
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                              Updated{" "}
                              {formatDate(
                                shipment.updated_at
                              )}
                            </p>
                          </div>

                          <div className="w-full xl:w-72">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                              <span>
                                Journey progress
                              </span>

                              <span>
                                {Math.min(
                                  progress + 1,
                                  STAGES.length
                                )}
                                /
                                {
                                  STAGES.length
                                }
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{
                                  width: `${
                                    ((progress + 1) /
                                      STAGES.length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Common operational tasks.
            </p>

            <div className="mt-5 space-y-3">
              {canCreateShipment && (
                <Link
                  href="/operations/shipment/create"
                  className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-950">
                    Create Shipment
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Register a new parcel and generate
                    its tracking record.
                  </p>
                </Link>
              )}

              <Link
                href="/operations/shipment"
                className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <p className="font-semibold text-slate-950">
                  Manage Shipments
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Update stages, locations and
                  operational events.
                </p>
              </Link>

              <Link
                href="/driver"
                className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <p className="font-semibold text-slate-950">
                  Update Location
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Publish a manual operational
                  location for a shipment.
                </p>
              </Link>

              <Link
                href="/operations/enquiries"
                className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">
                    Customer Enquiries
                  </p>

                  {newEnquiriesCount > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      {newEnquiriesCount} new
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Review and respond to customer
                  support requests.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Activity + Support */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Recent Shipment Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest operational events.
                </p>
              </div>

              <Link
                href="/operations/shipment"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentEvents.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  No shipment activity available.
                </div>
              ) : (
                recentEvents.map((event) => {
                  const shipment =
                    shipments.find(
                      (item) =>
                        item.id ===
                        event.shipment_id
                    );

                  return (
                    <div
                      key={event.id}
                      className="p-5"
                    >
                      <div className="flex gap-4">
                        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-950">
                              {event.status ||
                                "Shipment Update"}
                            </p>

                            {shipment && (
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                                {
                                  shipment.tracking_number
                                }
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-slate-600">
                            {event.description ||
                              "Shipment operational update."}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              {event.location ||
                                "Location unavailable"}
                            </span>

                            <span>
                              {formatDate(
                                event.created_at
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Audit Activity */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Security & Operations
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-950">
                  Recent Audit Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recent staff actions performed on shipments.
                </p>
              </div>

              <Link
                href="/operations/audit"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                View Full Audit Log
              </Link>
            </div>

            {auditLogs.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No audit activity yet.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Staff shipment actions will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                          {log.action}
                        </span>

                        <Link
                          href={`/operations/shipment?tracking=${encodeURIComponent(
                            log.tracking_number
                          )}`}
                          className="text-sm font-black text-slate-950 hover:text-blue-600"
                        >
                          {log.tracking_number}
                        </Link>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {log.description}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        {log.performed_by || "ParcelPilot Staff"}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-semibold text-slate-400">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Customer Support */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Customer Support
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recent customer enquiries.
                </p>
              </div>

              <Link
                href="/operations/enquiries"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentEnquiries.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  No customer enquiries yet.
                </div>
              ) : (
                recentEnquiries.map(
                  (enquiry) => (
                    <Link
                      key={enquiry.id}
                      href="/operations/enquiries"
                      className="block p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-950">
                            {enquiry.subject}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {enquiry.full_name}
                          </p>

                          {enquiry.tracking_number && (
                            <p className="mt-1 text-xs font-semibold text-blue-600">
                              {
                                enquiry.tracking_number
                              }
                            </p>
                          )}

                          <p className="mt-2 text-xs text-slate-500">
                            {formatDate(
                              enquiry.created_at
                            )}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                            enquiry.status ===
                            "Resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : enquiry.status ===
                                "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {enquiry.status}
                        </span>
                      </div>
                    </Link>
                  )
                )
              )}
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                ParcelPilot System Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Core operational services currently
                connected to the dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                ● Database Connected
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                ● Realtime Active
              </span>

              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                ● Tracking Active
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center text-xs text-slate-400">
          ParcelPilot Logistics · Staff Operations
        </footer>
      </div>
    </main>
  );
}

export default function OperationsPage() {
  return (
    <RequireAuth>
      <OperationsDashboard />
    </RequireAuth>
  );
}