"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ShipmentEvent = {
  id: string;
  status: string | null;
  status_code: string | null;
  description: string | null;
  location: string | null;
  created_at: string | null;
};

type Props = {
  shipmentId: string;
};

function formatDate(value: string | null) {
  if (!value) return "Unknown time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString();
}

function getDotClass(status: string | null) {
  if (status === "Delivered") return "bg-emerald-500";
  if (status === "Out for Delivery") return "bg-blue-500";
  if (status === "Customs Clearance") return "bg-amber-500";
  if (status === "In Flight") return "bg-indigo-500";

  return "bg-slate-400";
}

export default function ShipmentEventHistory({
  shipmentId,
}: Props) {
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    if (!shipmentId) return;

    const { data } = await supabase
      .from("shipment_events")
      .select(
        "id, status, status_code, description, location, created_at"
      )
      .eq("shipment_id", shipmentId)
      .order("created_at", { ascending: false });

    setEvents((data ?? []) as ShipmentEvent[]);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();

    const channel = supabase
      .channel(`shipment-events-${shipmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipment_events",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Tracking History
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Published Shipment Events
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Every operational update published to the customer tracking
            timeline appears here.
          </p>
        </div>

        <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
          Live
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
            Loading tracking history...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-medium text-slate-700">
              No tracking events yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Publish an operational update to create the first event.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-[7px] top-0 w-px bg-slate-200" />

            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="relative flex gap-4"
                >
                  <div
                    className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full ring-4 ring-white ${getDotClass(
                      event.status
                    )}`}
                  />

                  <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {event.status || "Shipment Update"}
                        </h3>

                        {event.status_code && (
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                            {event.status_code}
                          </p>
                        )}
                      </div>

                      <time className="text-xs text-slate-500">
                        {formatDate(event.created_at)}
                      </time>
                    </div>

                    {event.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {event.description}
                      </p>
                    )}

                    {event.location && (
                      <div className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600">
                        Location: {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
