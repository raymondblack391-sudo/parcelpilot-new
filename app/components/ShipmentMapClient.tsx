"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ShipmentMapProps } from "./ShipmentMap";

const ShipmentMap = dynamic(() => import("./ShipmentMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl bg-slate-100">
      <p className="text-slate-500">Loading shipment map...</p>
    </div>
  ),
});

type Coord = { latitude: number; longitude: number };

type Props = ShipmentMapProps & { shipmentId?: string };

export default function ShipmentMapClient({ shipmentId, ...props }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Coord[] | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!shipmentId) return;
    const { data, error } = await supabase
      .from("tracking_locations")
      .select("latitude, longitude, recorded_at")
      .eq("shipment_id", shipmentId)
      .order("recorded_at", { ascending: true });
    if (error || !data) return;
    const valid = data
      .map((r) => ({ latitude: Number(r.latitude), longitude: Number(r.longitude) }))
      .filter(
        (r) =>
          Number.isFinite(r.latitude) &&
          Number.isFinite(r.longitude) &&
          Math.abs(r.latitude) <= 90 &&
          Math.abs(r.longitude) <= 180
      );
    setRows(valid);
  }, [shipmentId]);

  useEffect(() => {
    if (!shipmentId) return;
    load();

    const refreshStatus = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 400);
    };

    const channel = supabase
      .channel(`live-map-${shipmentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tracking_locations", filter: `shipment_id=eq.${shipmentId}` },
        () => {
          load();
          refreshStatus();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipment_events", filter: `shipment_id=eq.${shipmentId}` },
        refreshStatus
      )
      .subscribe();

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 8000);

    return () => {
      clearInterval(poll);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
  }, [shipmentId, load, router]);

  const live = rows && rows.length > 0 ? rows : null;

  return (
    <ShipmentMap
      {...props}
      currentLocation={live ? live[live.length - 1] : props.currentLocation}
      route={live ?? props.route}
    />
  );
}
