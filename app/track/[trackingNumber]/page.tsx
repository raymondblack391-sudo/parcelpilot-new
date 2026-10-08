import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ShipmentMapClient from "@/app/components/ShipmentMapClient";
import ShipmentRealtime from "@/app/components/ShipmentRealtime";
import CustomerSupportForm from "@/app/components/CustomerSupportForm";
import CopyTrackingButton from "@/app/components/CopyTrackingButton";
import TrackingSearch from "@/app/components/TrackingSearch";

type Props = {
  params: Promise<{
    trackingNumber: string;
  }>;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

type ProgressStage = {
  label: string;
  code: string;
};

type Shipment = {
  id: string;
  tracking_number: string | null;
  sender_name: string | null;
  receiver_name: string | null;
  sender_address: string | null;
  receiver_address: string | null;
  origin_country: string | null;
  destination_country: string | null;
  origin_airport: string | null;
  destination_airport: string | null;
  origin_latitude: number | null;
  origin_longitude: number | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
  current_latitude: number | null;
  current_longitude: number | null;
  status: string | null;
  status_code: string | null;
  shipping_mode: string | null;
  service_type: string | null;
  package_count: number | null;
  package_weight: number | null;
  estimated_delivery_date: string | null;
  awb_number: string | null;
  flight_number: string | null;
  currency: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ShipmentEvent = {
  id: string;
  status: string | null;
  status_code: string | null;
  description: string | null;
  location: string | null;
  created_at: string | null;
};

type TrackingLocation = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  recorded_at: string | null;
};

const progressStages: ProgressStage[] = [
  { label: "Picked Up", code: "PICKED_UP" },
  { label: "Origin Facility", code: "ORIGIN_FACILITY" },
  { label: "Origin Airport", code: "ORIGIN_AIRPORT" },
  { label: "In Transit", code: "IN_TRANSIT" },
  { label: "Destination Airport", code: "DESTINATION_AIRPORT" },
  { label: "Customs Clearance", code: "CUSTOMS_CLEARANCE" },
  { label: "Customs Released", code: "CUSTOMS_RELEASED" },
  { label: "Destination Facility", code: "DESTINATION_FACILITY" },
  { label: "Out for Delivery", code: "OUT_FOR_DELIVERY" },
  { label: "Delivered", code: "DELIVERED" },
];

function normalizeStatusCode(
  statusCode: string | null,
  status: string | null
) {
  const value = (statusCode || status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  const aliases: Record<string, string> = {
    CREATED: "SHIPMENT_CREATED",
    SHIPMENT_CREATED: "SHIPMENT_CREATED",
    PICKED_UP: "PICKED_UP",
    ORIGIN_FACILITY: "ORIGIN_FACILITY",
    ORIGIN_AIRPORT: "ORIGIN_AIRPORT",
    IN_TRANSIT: "IN_TRANSIT",
    IN_FLIGHT: "IN_TRANSIT",
    DESTINATION_AIRPORT: "DESTINATION_AIRPORT",
    CUSTOMS_CLEARANCE: "CUSTOMS_CLEARANCE",
    CUSTOMS_RELEASED: "CUSTOMS_RELEASED",
    DESTINATION_FACILITY: "DESTINATION_FACILITY",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
  };

  return aliases[value] || value;
}

function getProgressIndex(
  statusCode: string | null,
  status: string | null
) {
  const normalized = normalizeStatusCode(
    statusCode,
    status
  );

  const index = progressStages.findIndex(
    (stage) => stage.code === normalized
  );

  if (index >= 0) {
    return index;
  }

  if (status?.toLowerCase() === "in transit") {
    return 3;
  }

  if (status?.toLowerCase() === "out for delivery") {
    return 8;
  }

  if (status?.toLowerCase() === "delivered") {
    return 9;
  }

  return 0;
}

function isValidCoordinate(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

function coordinate(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): Coordinate | null {
  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }

  return {
    latitude: latitude as number,
    longitude: longitude as number,
  };
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

function formatStatus(status: string | null) {
  if (!status) {
    return "Shipment information available";
  }

  return status;
}

function statusCodeLabel(event: ShipmentEvent) {
  return (
    event.status_code ||
    normalizeStatusCode(null, event.status)
  );
}

function getStatusTone(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "delivered") {
    return {
      badge: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (
    value.includes("customs") ||
    value.includes("airport")
  ) {
    return {
      badge: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    };
  }

  if (
    value.includes("transit") ||
    value.includes("flight") ||
    value.includes("out for delivery")
  ) {
    return {
      badge: "bg-blue-100 text-blue-700",
      dot: "bg-blue-500",
    };
  }

  return {
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  };
}

export default async function TrackingPage({
  params,
}: Props) {
  const { trackingNumber } = await params;

  const cleanTrackingNumber = decodeURIComponent(
    trackingNumber
  ).trim();

  const {
    data: shipment,
    error: shipmentError,
  } = await supabase
    .rpc(
      "get_public_shipment",
      {
        p_tracking_number: cleanTrackingNumber,
      }
    )
    .maybeSingle();

  if (shipmentError || !shipment) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-white/10 bg-slate-950">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-black text-white shadow-lg">
                P
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

            <Link
              href="/track"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Track Another
            </Link>
          </div>
        </header>

        <section className="flex min-h-[75vh] items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-3xl font-black text-orange-400">
              !
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              ParcelPilot Logistics
            </p>

            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              Shipment not found
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              We could not find a shipment matching the tracking number you entered.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Tracking Number
              </p>

              <p className="mt-2 break-all text-lg font-black text-orange-400">
                {cleanTrackingNumber}
              </p>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Check the number for missing or incorrect characters, then try again.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/track"
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                Try Another Tracking Number
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Return Home
              </Link>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
              <p className="text-sm text-slate-500">
                Still having trouble?
              </p>

              <Link
                href="/track"
                className="mt-2 inline-block text-sm font-bold text-orange-400 transition hover:text-orange-300"
              >
                Contact ParcelPilot Support →
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800 px-6 py-8">
          <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">
            ParcelPilot Logistics
          </div>
        </footer>
      </main>
    );
  }

  const typedShipment = shipment as Shipment;

  const { data: events } = await supabase
    .from("shipment_events")
    .select("*")
    .eq("shipment_id", typedShipment.id)
    .order("created_at", {
      ascending: false,
    });

  const { data: locations } = await supabase
    .from("tracking_locations")
    .select("*")
    .eq("shipment_id", typedShipment.id)
    .order("recorded_at", {
      ascending: true,
    });

  const shipmentEvents =
    (events || []) as ShipmentEvent[];

  const trackingLocations =
    (locations || []) as TrackingLocation[];

  const latestLocation =
    trackingLocations.length > 0
      ? trackingLocations[
          trackingLocations.length - 1
        ]
      : null;

  const originLocation = coordinate(
    typedShipment.origin_latitude,
    typedShipment.origin_longitude
  );

  const destinationLocation = coordinate(
    typedShipment.destination_latitude,
    typedShipment.destination_longitude
  );

  const currentLocation = coordinate(
    typedShipment.current_latitude,
    typedShipment.current_longitude
  );

  const locationRoute: Coordinate[] =
    trackingLocations
      .filter((item) =>
        isValidCoordinate(
          item.latitude,
          item.longitude
        )
      )
      .map((item) => ({
        latitude: item.latitude as number,
        longitude: item.longitude as number,
      }));

  const route: Coordinate[] =
    locationRoute.length > 0
      ? locationRoute
      : currentLocation
        ? [currentLocation]
        : [];

  const originAirportLocation = null;
  const destinationAirportLocation = null;

  const progressIndex = getProgressIndex(
    typedShipment.status_code,
    typedShipment.status
  );

  const latestEvent =
    shipmentEvents.length > 0
      ? shipmentEvents[0]
      : null;

  const status = formatStatus(
    typedShipment.status
  );

  const statusTone = getStatusTone(
    typedShipment.status
  );

  const progressPercentage =
    ((progressIndex + 1) /
      progressStages.length) *
    100;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <ShipmentRealtime
        shipmentId={typedShipment.id}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20">
              P
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

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-semibold text-slate-300 transition hover:text-orange-400 sm:block"
            >
              Home
            </Link>

            <TrackingSearch />

            <Link
              href="/track"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-orange-500 hover:bg-orange-500"
            >
              Track Another
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 px-5 py-14 text-white sm:px-6 sm:py-20">
        <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-orange-500/20 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[25rem] w-[25rem] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-400">
                  Shipment Tracking
                </span>

                <span className="text-xs font-semibold text-slate-500">
                  Live operational updates
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Track your shipment.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Follow your shipment from origin to destination
                with the latest available delivery information.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Tracking Number
              </p>

              <p className="mt-2 break-all text-2xl font-black tracking-tight text-white">
                {typedShipment.tracking_number}
              </p>

              <CopyTrackingButton
                trackingNumber={typedShipment.tracking_number || ""}
              />

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusTone.dot}`}
                />

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone.badge}`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* LIVE STATUS PANEL */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
            <div className="border-b border-slate-800 bg-slate-900 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
                    <span
                      className={`h-3 w-3 rounded-full ${statusTone.dot}`}
                    />

                    {typedShipment.status !== "Delivered" && (
                      <span
                        className={`absolute h-3 w-3 animate-ping rounded-full ${statusTone.dot} opacity-60`}
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                      Shipment Status
                    </p>

                    <p className="mt-1 text-lg font-black text-white">
                      {status}
                    </p>
                  </div>
                </div>

                <div className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational tracking
                  </span>
                </div>
              </div>
            </div>

            <div className="grid divide-y divide-slate-800 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Last Published Location
                </p>

                <p className="mt-3 text-lg font-black text-white">
                  {latestEvent?.location ||
                    "Location available on map"}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {latestLocation?.recorded_at
                    ? `Location recorded ${formatDate(
                        latestLocation.recorded_at
                      )}`
                    : "Latest operational location"}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Last Update
                </p>

                <p className="mt-3 text-lg font-black text-white">
                  {latestLocation?.recorded_at
                    ? formatDate(
                        latestLocation.recorded_at
                      )
                    : formatDate(
                        typedShipment.updated_at
                      )}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Latest location or shipment record update
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Latest Tracking Note
                </p>

                <p className="mt-3 text-sm font-bold leading-6 text-white">
                  {latestEvent?.description ||
                    "No additional tracking note available."}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {latestEvent?.status ||
                    "Shipment update"}
                </p>
              </div>
            </div>

            {latestLocation &&
              isValidCoordinate(
                latestLocation.latitude,
                latestLocation.longitude
              ) && (
                <div className="border-t border-slate-800 bg-slate-950/60 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                        Latest Coordinates
                      </p>

                      <p className="mt-1 font-mono text-sm font-bold text-slate-300">
                        {latestLocation.latitude},{" "}
                        {latestLocation.longitude}
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-slate-500">
                      Source: ParcelPilot operational tracking
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* PROGRESS */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
                    Shipment Progress
                  </p>

                  {progressIndex === progressStages.length - 1 && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      Delivered
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  Delivery journey
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Follow the shipment through each operational stage from
                  pickup to final delivery.
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-5 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-sm font-black text-orange-600">
                  {progressIndex + 1}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Progress
                  </p>

                  <p className="mt-1 text-lg font-black text-slate-950">
                    {progressIndex + 1}
                    <span className="text-sm font-semibold text-slate-400">
                      /{progressStages.length}
                    </span>
                  </p>

                  <p className="text-xs font-semibold text-slate-500">
                    {progressStages[progressIndex]?.label ||
                      "Shipment stage"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">
                  Shipment completion
                </span>

                <span className="text-orange-600">
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    progressIndex === progressStages.length - 1
                      ? "bg-emerald-500"
                      : "bg-orange-500"
                  }`}
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-7 sm:px-8">
            <div className="space-y-6 md:hidden">
              {progressStages.map((stage, index) => {
                const completed =
                  index < progressIndex;

                const current =
                  index === progressIndex;

                const upcoming =
                  index > progressIndex;

                return (
                  <div
                    key={stage.code}
                    className="relative flex gap-4"
                  >
                    {index < progressStages.length - 1 && (
                      <div
                        className={`absolute left-5 top-11 h-[calc(100%+1.5rem)] w-0.5 ${
                          index < progressIndex
                            ? "bg-orange-400"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-slate-50 text-xs font-black ${
                        completed
                          ? "bg-orange-500 text-white"
                          : current
                            ? "bg-orange-500 text-white ring-4 ring-orange-100"
                            : "bg-white text-slate-400 shadow-sm"
                      }`}
                    >
                      {completed
                        ? "✓"
                        : current
                          ? "●"
                          : index + 1}
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm font-black ${
                            current
                              ? "text-orange-600"
                              : upcoming
                                ? "text-slate-400"
                                : "text-slate-700"
                          }`}
                        >
                          {stage.label}
                        </p>

                        {current && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-600">
                            Current
                          </span>
                        )}

                        {completed && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            Complete
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {current
                          ? "Current operational stage"
                          : completed
                            ? "Stage completed"
                            : "Upcoming stage"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto pb-3 md:block">
              <div className="min-w-[1100px]">
                <div className="relative flex items-start">
                  <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-200" />

                  <div
                    className={`absolute left-0 top-5 h-1 rounded-full transition-all duration-700 ${
                      progressIndex === progressStages.length - 1
                        ? "bg-emerald-500"
                        : "bg-orange-500"
                    }`}
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />

                  {progressStages.map((stage, index) => {
                    const completed =
                      index < progressIndex;

                    const current =
                      index === progressIndex;

                    return (
                      <div
                        key={stage.code}
                        className="relative z-10 flex flex-1 flex-col items-center"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-50 text-xs font-black shadow-sm ${
                            completed
                              ? "bg-orange-500 text-white"
                              : current
                                ? "bg-orange-500 text-white ring-4 ring-orange-100"
                                : "bg-white text-slate-400"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : current
                              ? "●"
                              : index + 1}
                        </div>

                        <div className="mt-4 text-center">
                          <p
                            className={`text-xs font-black ${
                              current
                                ? "text-orange-600"
                                : completed
                                  ? "text-slate-700"
                                  : "text-slate-400"
                            }`}
                          >
                            {stage.label}
                          </p>

                          {current ? (
                            <span className="mt-2 inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-orange-600">
                              Current
                            </span>
                          ) : completed ? (
                            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-600">
                              Complete
                            </span>
                          ) : (
                            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 sm:px-8">
            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Current stage:{" "}
                <strong className="font-black text-slate-700">
                  {progressStages[progressIndex]?.label ||
                    "Shipment tracking"}
                </strong>
              </span>

              <span>
                {progressIndex === progressStages.length - 1
                  ? "Shipment journey completed"
                  : "Shipment journey in progress"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ROUTE + DETAILS */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ROUTE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
                  Shipment Route
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Origin to destination
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your shipment journey from its origin point to the final destination.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-600">
                {typedShipment.shipping_mode || "International"}
              </span>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-7">

              <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">

                {/* ORIGIN */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                      O
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Origin
                      </p>

                      <p className="text-xs font-bold text-slate-500">
                        Shipment starting point
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-slate-950">
                    {typedShipment.origin_country || "Origin"}
                  </h3>

                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {typedShipment.origin_airport ||
                      typedShipment.sender_address ||
                      "Origin location"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {typedShipment.origin_airport && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Airport
                      </span>
                    )}

                    {typedShipment.origin_latitude !== null &&
                      typedShipment.origin_longitude !== null && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Coordinates published
                        </span>
                      )}
                  </div>
                </div>

                {/* ROUTE CONNECTOR */}
                <div className="flex items-center justify-center md:flex-col">
                  <div className="hidden h-px w-20 bg-slate-300 md:block" />

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-100">
                    →
                  </div>

                  <div className="hidden h-px w-20 bg-slate-300 md:block" />
                </div>

                {/* DESTINATION */}
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-white">
                      D
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-500">
                        Destination
                      </p>

                      <p className="text-xs font-bold text-slate-500">
                        Final delivery point
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-slate-950">
                    {typedShipment.destination_country ||
                      "Destination"}
                  </h3>

                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {typedShipment.destination_airport ||
                      typedShipment.receiver_address ||
                      "Destination location"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {typedShipment.destination_airport && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        Airport
                      </span>
                    )}

                    {typedShipment.destination_latitude !== null &&
                      typedShipment.destination_longitude !== null && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Coordinates published
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* ROUTE SUMMARY */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Service
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    {typedShipment.service_type || "Standard"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Shipping Mode
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    {typedShipment.shipping_mode || "International"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Estimated Delivery
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    {typedShipment.estimated_delivery_date
                      ? formatDate(
                          typedShipment.estimated_delivery_date
                        )
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SHIPMENT DETAILS */}
          <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
              Shipment Details
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              Shipment information
            </h2>

            <div className="mt-6 space-y-4 text-sm">

              <div className="flex justify-between gap-4 border-b border-orange-100 pb-3">
                <span className="text-slate-500">
                  Service
                </span>

                <strong className="text-right text-slate-900">
                  {typedShipment.service_type || "Standard"}
                </strong>
              </div>

              <div className="flex justify-between gap-4 border-b border-orange-100 pb-3">
                <span className="text-slate-500">
                  Package
                </span>

                <strong className="text-right text-slate-900">
                  {typedShipment.package_count || 1}{" "}
                  piece
                  {(typedShipment.package_count || 1) !== 1
                    ? "s"
                    : ""}
                </strong>
              </div>

              <div className="flex justify-between gap-4 border-b border-orange-100 pb-3">
                <span className="text-slate-500">
                  Weight
                </span>

                <strong className="text-right text-slate-900">
                  {typedShipment.package_weight !== null
                    ? `${typedShipment.package_weight} kg`
                    : "Not available"}
                </strong>
              </div>

              <div className="flex justify-between gap-4 border-b border-orange-100 pb-3">
                <span className="text-slate-500">
                  Estimated Delivery
                </span>

                <strong className="text-right text-slate-900">
                  {typedShipment.estimated_delivery_date
                    ? formatDate(
                        typedShipment.estimated_delivery_date
                      )
                    : "Not available"}
                </strong>
              </div>

              {typedShipment.awb_number && (
                <div className="flex justify-between gap-4 border-b border-orange-100 pb-3">
                  <span className="text-slate-500">
                    AWB
                  </span>

                  <strong className="text-right text-slate-900">
                    {typedShipment.awb_number}
                  </strong>
                </div>
              )}

              {typedShipment.flight_number && (
                <div className="flex justify-between gap-4 border-b border-orange-100 pb-3">
                  <span className="text-slate-500">
                    Flight
                  </span>

                  <strong className="text-right text-slate-900">
                    {typedShipment.flight_number}
                  </strong>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Currency
                </span>

                <strong className="text-right text-slate-900">
                  {typedShipment.currency || "Not available"}
                </strong>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* EXTRA DETAILS */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "AWB Number",
              value:
                typedShipment.awb_number ||
                "Not available",
            },
            {
              label: "Flight",
              value:
                typedShipment.flight_number ||
                "Not available",
            },
            {
              label: "Currency",
              value:
                typedShipment.currency ||
                "Not available",
            },
            {
              label: "Last Updated",
              value: formatDate(
                typedShipment.updated_at
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>

              <p className="mt-2 break-words font-black text-slate-800">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SENDER / RECEIVER */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 font-black text-orange-600">
                S
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                  Sender
                </p>

                <p className="text-xs text-slate-400">
                  Shipment origin
                </p>
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              {typedShipment.sender_name ||
                "Sender"}
            </h2>

            <p className="mt-2 leading-7 text-slate-500">
              {typedShipment.sender_address ||
                typedShipment.origin_country ||
                "Origin information available"}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 font-black text-orange-600">
                R
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                  Receiver
                </p>

                <p className="text-xs text-slate-400">
                  Shipment destination
                </p>
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              {typedShipment.receiver_name ||
                "Receiver"}
            </h2>

            <p className="mt-2 leading-7 text-slate-500">
              {typedShipment.receiver_address ||
                typedShipment.destination_country ||
                "Destination information available"}
            </p>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
                    Shipment Location Map
                  </p>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                    Operator Published
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  Shipment movement
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  View the shipment origin, manually published operational
                  locations, route history and final destination.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Current Status
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-black text-slate-900">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${statusTone.dot}`}
                  />

                  {status}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                    O
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Origin
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-800">
                      {originLocation
                        ? "Published"
                        : "Not published"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                    ●
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                      Current Location
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-800">
                      {currentLocation
                        ? "Published"
                        : "Awaiting update"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                    D
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Destination
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-800">
                      {destinationLocation
                        ? "Published"
                        : "Not published"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              <ShipmentMapClient
                originLocation={originLocation}
                currentLocation={currentLocation}
                destination={destinationLocation}
                route={route}
                shippingMode={
                  typedShipment.shipping_mode
                }
                serviceType={
                  typedShipment.service_type
                }
                originAirport={
                  typedShipment.origin_airport
                }
                destinationAirport={
                  typedShipment.destination_airport
                }
                originAirportLocation={
                  originAirportLocation
                }
                destinationAirportLocation={
                  destinationAirportLocation
                }
                status={typedShipment.status}
                flightNumber={
                  typedShipment.flight_number
                }
                awbNumber={
                  typedShipment.awb_number
                }
                trackingNumber={
                  typedShipment.tracking_number ||
                  cleanTrackingNumber
                }
              />
            </div>

            {currentLocation ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                      Last Published Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Coordinates published by ParcelPilot operations.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Latitude
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-900">
                        {currentLocation.latitude}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Longitude
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-900">
                        {currentLocation.longitude}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Location Update
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-600">
                  No operational coordinates have been published yet.
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Tracking Source
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-200">
                  ParcelPilot operational tracking
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-slate-300">
                  Manual location
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-slate-300">
                  Live updates
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-slate-300">
                  OpenStreetMap
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRACKING HISTORY */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
                  Tracking History
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  Shipment activity
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  A detailed record of the operational updates published
                  for this shipment.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Activity
                  </p>

                  <p className="text-sm font-black text-slate-800">
                    {shipmentEvents.length}{" "}
                    {shipmentEvents.length === 1
                      ? "event"
                      : "events"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-8">
            {shipmentEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  •••
                </div>

                <p className="mt-4 font-black text-slate-700">
                  No tracking events yet
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Shipment activity will appear here as operational
                  updates are published.
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl">
                {shipmentEvents.map((event, index) => {
                  const isLatest = index === 0;

                  const normalizedCode =
                    normalizeStatusCode(
                      event.status_code,
                      event.status
                    );

                  const isManualLocation =
                    normalizedCode === "LOCATION_UPDATE";

                  return (
                    <div
                      key={event.id}
                      className="relative flex gap-4 sm:gap-6"
                    >
                      {/* TIMELINE */}
                      <div className="relative flex w-10 shrink-0 flex-col items-center">
                        <div
                          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-slate-50 text-sm font-black shadow-sm ${
                            isLatest
                              ? isManualLocation
                                ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                : "bg-orange-500 text-white ring-4 ring-orange-100"
                              : isManualLocation
                                ? "bg-blue-500 text-white"
                                : "bg-emerald-500 text-white"
                          }`}
                        >
                          {isLatest
                            ? "●"
                            : isManualLocation
                              ? "⌖"
                              : "✓"}
                        </div>

                        {index <
                          shipmentEvents.length - 1 && (
                          <div
                            className={`absolute top-11 h-[calc(100%-2.75rem)] w-0.5 ${
                              index === 0
                                ? "bg-orange-200"
                                : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* EVENT CARD */}
                      <div
                        className={`mb-5 min-w-0 flex-1 rounded-2xl border p-5 sm:p-6 ${
                          isLatest
                            ? isManualLocation
                              ? "border-blue-200 bg-blue-50/70 shadow-sm"
                              : "border-orange-200 bg-orange-50/70 shadow-sm"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-black text-slate-950 sm:text-lg">
                                {event.status ||
                                  "Shipment Update"}
                              </h3>

                              {isLatest && (
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white ${
                                    isManualLocation
                                      ? "bg-blue-600"
                                      : "bg-orange-500"
                                  }`}
                                >
                                  Latest
                                </span>
                              )}

                              {isManualLocation && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-blue-700">
                                  Manual Location
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              {event.created_at
                                ? formatDate(event.created_at)
                                : "Time not available"}
                            </p>
                          </div>

                          <span
                            className={`w-fit shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider ${
                              isManualLocation
                                ? "bg-blue-100 text-blue-700"
                                : isLatest
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isManualLocation
                              ? "MANUAL LOCATION"
                              : statusCodeLabel(event)}
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          {event.description ||
                            "Shipment status updated."}
                        </p>

                        {event.location && (
                          <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                isManualLocation
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              ●
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                Operational Location
                              </p>

                              <p className="mt-1 break-words text-sm font-black text-slate-700">
                                {event.location}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {shipmentEvents.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4 sm:px-8">
              <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing the latest operational activity first.
                </span>

                <span className="font-semibold text-slate-400">
                  ParcelPilot tracking record
                </span>
              </div>
            </div>
          )}

        </div>
      </section>

      <CustomerSupportForm
        trackingNumber={typedShipment.tracking_number || trackingNumber}
      />

      {/* TRACK ANOTHER SHIPMENT */}
      <section className="border-t border-slate-800 bg-slate-900 px-5 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-orange-400">
            →
          </div>

          <h2 className="mt-5 text-2xl font-black text-white sm:text-3xl">
            Track Another Shipment
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Enter another tracking number to view its latest shipment status,
            location, journey and tracking history.
          </p>

          <Link
            href="/track"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600"
          >
            Track Another Shipment →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 px-5 py-12 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-black">
              P
            </div>

            <div>
              <p className="font-black">
                ParcelPilot Logistics
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                International courier, express and logistics tracking.
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
              href="/track"
              className="font-semibold text-slate-400 transition hover:text-white"
            >
              Track Shipment
            </Link>

            <Link
              href="/"
              className="font-bold text-orange-400 transition hover:text-orange-300"
            >
              Return to ParcelPilot →
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-600">
          © {new Date().getFullYear()} ParcelPilot Logistics. All rights reserved.
        </div>
      </footer>
    </main>
  );
}