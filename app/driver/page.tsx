"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StaffNav from "@/app/components/StaffNav";
import RequireAuth from "@/app/components/RequireAuth";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: string;
  tracking_number: string;
  sender_name: string | null;
  receiver_name: string | null;
  status: string | null;
  status_code: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  origin_country: string | null;
  destination_country: string | null;
};

type TrackingLocation = {
  id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

export default function DriverPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] =
    useState("");

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [trackingNote, setTrackingNote] = useState("");

  const [trackingLocations, setTrackingLocations] =
    useState<TrackingLocation[]>([]);

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadShipments() {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        id,
        tracking_number,
        sender_name,
        receiver_name,
        status,
        status_code,
        current_latitude,
        current_longitude,
        origin_country,
        destination_country
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setShipments((data || []) as Shipment[]);
    setLoading(false);
  }

  async function loadTrackingLocations(
    shipmentId: string
  ) {
    if (!shipmentId) {
      setTrackingLocations([]);
      return;
    }

    const { data, error } = await supabase
      .from("tracking_locations")
      .select(`
        id,
        latitude,
        longitude,
        recorded_at
      `)
      .eq("shipment_id", shipmentId)
      .order("recorded_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setTrackingLocations(
      (data || []) as TrackingLocation[]
    );
  }

  useEffect(() => {
    loadShipments();

    const channel = supabase
      .channel("manual-location-shipments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipments",
        },
        () => {
          loadShipments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!selectedShipmentId) {
      setTrackingLocations([]);
      return;
    }

    const shipment = shipments.find(
      (item) => item.id === selectedShipmentId
    );

    if (shipment) {
      setLatitude(
        shipment.current_latitude !== null
          ? String(shipment.current_latitude)
          : ""
      );

      setLongitude(
        shipment.current_longitude !== null
          ? String(shipment.current_longitude)
          : ""
      );

      setLocation("");
      setTrackingNote("");
    }

    loadTrackingLocations(selectedShipmentId);

    const channel = supabase
      .channel(
        `manual-location-${selectedShipmentId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tracking_locations",
          filter: `shipment_id=eq.${selectedShipmentId}`,
        },
        () => {
          loadTrackingLocations(selectedShipmentId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedShipmentId, shipments]);

  async function publishLocation() {
    setMessage("");
    setError("");

    if (!selectedShipmentId) {
      setError("Please select a shipment.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter the shipment location.");
      return;
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setError(
        "Please enter valid latitude and longitude."
      );
      return;
    }

    if (lat < -90 || lat > 90) {
      setError(
        "Latitude must be between -90 and 90."
      );
      return;
    }

    if (lon < -180 || lon > 180) {
      setError(
        "Longitude must be between -180 and 180."
      );
      return;
    }

    setPublishing(true);

    try {
      /*
       * Find the selected shipment.
       */
      const selectedShipment = shipments.find(
        (shipment) =>
          shipment.id === selectedShipmentId
      );

      /*
       * 1. Save the location history.
       */
      const { error: locationError } =
        await supabase
          .from("tracking_locations")
          .insert({
            shipment_id: selectedShipmentId,
            latitude: lat,
            longitude: lon,
            recorded_at: new Date().toISOString(),
          });

      if (locationError) {
        throw locationError;
      }

      /*
       * 2. Update the shipment's current coordinates.
       */
      const { error: shipmentError } =
        await supabase
          .from("shipments")
          .update({
            current_latitude: lat,
            current_longitude: lon,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedShipmentId);

      if (shipmentError) {
        throw shipmentError;
      }

      /*
       * 3. Create a LOCATION UPDATE event.
       *
       * Important:
       * This does NOT change the shipment stage.
       * For example, a Customs Released shipment
       * remains Customs Released.
       */
      const historyDescription =
        trackingNote.trim() ||
        `Shipment location updated to ${location.trim()}.`;

      const { error: eventError } =
        await supabase
          .from("shipment_events")
          .insert({
            shipment_id: selectedShipmentId,
            status: "Location Update",
            status_code: "LOCATION_UPDATE",
            description: historyDescription,
            location: location.trim(),
            created_at: new Date().toISOString(),
          });

      if (eventError) {
        throw eventError;
      }

      /*
       * 4. Refresh data.
       */
      await loadShipments();

      await loadTrackingLocations(
        selectedShipmentId
      );

      /*
       * 5. Clear manual text fields.
       */
      setLocation("");
      setTrackingNote("");

      setMessage(
        `Location published successfully: ${location.trim()}`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish location."
      );
    } finally {
      setPublishing(false);
    }
  }

  const selectedShipment = shipments.find(
    (shipment) =>
      shipment.id === selectedShipmentId
  );

  return (
    <RequireAuth>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <StaffNav />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Fleet Operations
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Manual Shipment Location
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              Enter and publish shipment locations manually.
              No device GPS or personal location is used.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Select Shipment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose the shipment you want to update.
              </p>

              <div className="mt-5">
                <select
                  value={selectedShipmentId}
                  onChange={(event) => {
                    setSelectedShipmentId(
                      event.target.value
                    );
                    setMessage("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select a shipment
                  </option>

                  {shipments.map((shipment) => (
                    <option
                      key={shipment.id}
                      value={shipment.id}
                    >
                      {shipment.tracking_number} —{" "}
                      {shipment.status || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>

              {selectedShipment && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Tracking Number
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {selectedShipment.tracking_number}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">
                        Status
                      </p>

                      <p className="mt-1 font-semibold">
                        {selectedShipment.status ||
                          "Unknown"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">
                        Receiver
                      </p>

                      <p className="mt-1 font-semibold">
                        {selectedShipment.receiver_name ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-500">
                      Journey
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedShipment.origin_country ||
                        "Origin"}{" "}
                      →{" "}
                      {selectedShipment.destination_country ||
                        "Destination"}
                    </p>
                  </div>

                  <Link
                    href={`/track/${selectedShipment.tracking_number}`}
                    target="_blank"
                    className="block rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Open Customer Tracking
                  </Link>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Location Control
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manually publish the shipment&apos;s
                    current position.
                  </p>
                </div>

                <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  MANUAL MODE
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Operational Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Example: Reykjavik, Iceland"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(event) =>
                        setLatitude(event.target.value)
                      }
                      placeholder="64.1466"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(event) =>
                        setLongitude(event.target.value)
                      }
                      placeholder="-21.9426"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tracking Note
                  </label>

                  <textarea
                    value={trackingNote}
                    onChange={(event) =>
                      setTrackingNote(event.target.value)
                    }
                    rows={4}
                    placeholder="Example: Shipment has moved toward the final destination."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={publishLocation}
                  disabled={
                    publishing || !selectedShipmentId
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {publishing
                    ? "Publishing Location..."
                    : "Publish Location"}
                </button>
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Location History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Every manually published position is
                  recorded.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {trackingLocations.length} recorded{" "}
                {trackingLocations.length === 1
                  ? "location"
                  : "locations"}
              </div>
            </div>

            {trackingLocations.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="font-semibold text-slate-700">
                  No location history yet.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Publish a location above to create the
                  first tracking point.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {trackingLocations.map(
                  (point, index) => (
                    <div
                      key={point.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Location #
                          {trackingLocations.length -
                            index}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {new Date(
                            point.recorded_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="font-mono text-sm text-slate-700">
                        {point.latitude.toFixed(6)},{" "}
                        {point.longitude.toFixed(6)}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="font-bold text-blue-950">
              How manual tracking works
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-semibold text-blue-900">
                  1. Select shipment
                </p>

                <p className="mt-1 text-sm text-blue-800">
                  Choose the shipment you are operating.
                </p>
              </div>

              <div>
                <p className="font-semibold text-blue-900">
                  2. Enter location
                </p>

                <p className="mt-1 text-sm text-blue-800">
                  Enter the operational location and
                  coordinates yourself.
                </p>
              </div>

              <div>
                <p className="font-semibold text-blue-900">
                  3. Publish
                </p>

                <p className="mt-1 text-sm text-blue-800">
                  The map, location history and customer
                  tracking update automatically.
                </p>
              </div>
            </div>
          </section>

          {loading && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Loading shipments...
            </p>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}