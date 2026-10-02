"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  shipmentId: string;
};

export default function ShipmentRealtime({
  shipmentId,
}: Props) {
  const router = useRouter();
  const refreshTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    if (!shipmentId) {
      return;
    }

    function refreshPage() {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }

      refreshTimer.current = setTimeout(() => {
        router.refresh();
      }, 250);
    }

    const channel = supabase
      .channel(`parcelpilot-shipment-${shipmentId}`)

      // Shipment status and manually controlled coordinates
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipments",
          filter: `id=eq.${shipmentId}`,
        },
        refreshPage
      )

      // New manually published location
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tracking_locations",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        refreshPage
      )

      // Corrected manually published location
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tracking_locations",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        refreshPage
      )

      // Removed/corrected location records
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tracking_locations",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        refreshPage
      )

      // New tracking/status event
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shipment_events",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        refreshPage
      )

      // Corrected tracking event
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shipment_events",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        refreshPage
      )

      // Removed tracking event
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "shipment_events",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        refreshPage
      )

      .subscribe();

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }

      supabase.removeChannel(channel);
    };
  }, [shipmentId, router]);

  return null;
}