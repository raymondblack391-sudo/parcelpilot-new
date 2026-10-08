"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Leaflet needs the browser window, so load the map client-only
const ShipmentMap = dynamic(
  () => import("@/app/components/ShipmentMap"),
  { ssr: false }
);

type Shipment = {
  id: string;
  tracking_number: string;
  sender_name: string | null;
  receiver_name: string | null;
  customer_email: string | null;
  sender_address: string | null;
  receiver_address: string | null;
  origin_country: string | null;
  destination_country: string | null;
  status: string | null;
  status_code: string | null;
  service_type: string | null;
  shipping_mode: string | null;
  package_weight: number | null;
  package_count: number | null;
  flight_number: string | null;
  awb_number: string | null;
  // NEW: coordinates, needed for the map
  current_latitude: number | null;
  current_longitude: number | null;
  origin_latitude: number | null;
  origin_longitude: number | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
};

type ShipmentEvent = {
  id: string;
  shipment_id: string;
  status: string;
  status_code: string | null;
  description: string | null;
  location: string | null;
  created_at: string;
};

// NEW
type TrackingLocation = {
  id: string;
  shipment_id: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  recorded_at: string | null;
};

const STATUS_OPTIONS = [
  { status: "Shipment Created", code: "SHIPMENT_CREATED", description: "Your shipment has been registered with ParcelPilot." },
  { status: "Picked Up", code: "PICKED_UP", description: "Your shipment has been picked up and is being prepared for transportation." },
  { status: "At Origin Facility", code: "AT_ORIGIN_FACILITY", description: "Your shipment has arrived at the origin facility." },
  { status: "Departed Origin Airport", code: "DEPARTED_ORIGIN_AIRPORT", description: "Your shipment has departed the origin airport." },
  { status: "In Transit", code: "IN_TRANSIT", description: "Your shipment is currently in transit to its destination." },
  { status: "Arrived Destination Airport", code: "ARRIVED_DESTINATION_AIRPORT", description: "Your shipment has arrived at the destination airport." },
  { status: "Customs Clearance", code: "CUSTOMS_CLEARANCE", description: "Your shipment is currently undergoing customs clearance." },
  { status: "Customs Released", code: "CUSTOMS_RELEASED", description: "Your shipment has been released by customs." },
  { status: "Out for Delivery", code: "OUT_FOR_DELIVERY", description: "Your shipment is out for delivery to the recipient." },
  { status: "Delivered", code: "DELIVERED", description: "Your shipment has been successfully delivered." },
];

type ShipmentManagementClientProps = {
  shipmentId: string;
  tracking: string;
};

export default function ShipmentManagementClient({
  shipmentId,
  tracking,
}: ShipmentManagementClientProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [locations, setLocations] = useState<TrackingLocation[]>([]); // NEW

  const [status, setStatus] = useState("Shipment Created");
  const [statusCode, setStatusCode] = useState("SHIPMENT_CREATED");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("Your shipment has been registered with ParcelPilot.");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // NEW: manual location form state
  const [placeInput, setPlaceInput] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    console.log("Shipment page received parameters:", {
      shipmentId,
      tracking,
    });

    if (shipmentId) {
      loadShipmentById(shipmentId);
      return;
    }

    if (tracking) {
      setTrackingNumber(tracking);
      return;
    }

    setLoading(false);
    setError("No shipment was specified.");
  }, [shipmentId, tracking]);

  async function loadEvents(shipmentId: string) {
    const { data, error } = await supabase
      .from("shipment_events")
      .select(`id, shipment_id, status, status_code, description, location, created_at`)
      .eq("shipment_id", shipmentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Event loading error:", error);
      return;
    }

    setEvents(data || []);
  }

  // NEW
  async function loadLocations(shipmentId: string) {
    const { data, error } = await supabase
      .from("tracking_locations")
      .select(`id, shipment_id, latitude, longitude, location_name, recorded_at`)
      .eq("shipment_id", shipmentId)
      .order("recorded_at", { ascending: false });

    if (error) {
      console.error("Location loading error:", error);
      return;
    }

    setLocations(data || []);
  }

  async function finishShipmentLoad(data: Shipment) {
    setShipment(data);
    setTrackingNumber(data.tracking_number);
    setStatus(data.status || "Shipment Created");
    setStatusCode(data.status_code || "SHIPMENT_CREATED");

    await Promise.all([
      loadEvents(data.id),
      loadLocations(data.id),
    ]);

    setLoading(false);
  }

  async function loadShipment(tracking: string) {
    if (!tracking) {
      setLoading(false);
      setError("No tracking number was provided.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("shipments")
      .select(`
        id, tracking_number, sender_name, receiver_name, customer_email, sender_address, receiver_address,
        origin_country, destination_country, status, status_code, service_type, shipping_mode,
        package_weight, package_count, flight_number, awb_number,
        current_latitude, current_longitude, origin_latitude, origin_longitude,
        destination_latitude, destination_longitude
      `)
      .eq("tracking_number", tracking)
      .maybeSingle();

    if (error) {
      console.error("Shipment loading error:", error);
      setError(`Unable to load this shipment: ${error.message}`);
      setLoading(false);
      return;
    }

    if (!data) {
      setError(`Shipment ${tracking} was not found.`);
      setLoading(false);
      return;
    }

    await finishShipmentLoad(data);
  }

  async function loadShipmentById(shipmentId: string) {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("shipments")
      .select(`
        id, tracking_number, sender_name, receiver_name, customer_email, sender_address, receiver_address,
        origin_country, destination_country, status, status_code, service_type, shipping_mode,
        package_weight, package_count, flight_number, awb_number,
        current_latitude, current_longitude, origin_latitude, origin_longitude,
        destination_latitude, destination_longitude
      `)
      .eq("id", shipmentId)
      .maybeSingle();

    if (error) {
      console.error("Shipment loading by ID error:", error);
      setError(`Unable to load this shipment: ${error.message}`);
      setLoading(false);
      return;
    }

    if (!data) {
      setError("The shipment could not be found.");
      setLoading(false);
      return;
    }

    await finishShipmentLoad(data);
  }

  useEffect(() => {
    if (!trackingNumber) return;
    loadShipment(trackingNumber);
  }, [trackingNumber]);

  useEffect(() => {
    if (!shipment?.id) return;

    const channel = supabase
      .channel(`shipment-management-${shipment.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments", filter: `id=eq.${shipment.id}` }, () => {
        loadShipment(shipment.tracking_number);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "shipment_events", filter: `shipment_id=eq.${shipment.id}` }, () => {
        loadEvents(shipment.id);
      })
      // NEW: keep location history live too
      .on("postgres_changes", { event: "*", schema: "public", table: "tracking_locations", filter: `shipment_id=eq.${shipment.id}` }, () => {
        loadLocations(shipment.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipment?.id]);

  function handleStatusChange(selectedStatus: string) {
    const selected = STATUS_OPTIONS.find((item) => item.status === selectedStatus);
    if (!selected) return;

    setStatus(selected.status);
    setStatusCode(selected.code);
    setDescription(selected.description);
    setMessage("");
    setError("");
  }

  async function updateShipment() {
    if (!shipment) return;

    setUpdating(true);
    setMessage("");
    setError("");

    const { error: shipmentError } = await supabase
      .from("shipments")
      .update({ status, status_code: statusCode, updated_at: new Date().toISOString() })
      .eq("id", shipment.id);

    if (shipmentError) {
      console.error("Shipment update error:", shipmentError);
      setError("Unable to update the shipment status.");
      setUpdating(false);
      return;
    }

    const { data: newEvent, error: eventError } = await supabase
      .from("shipment_events")
      .insert({
        shipment_id: shipment.id,
        status,
        status_code: statusCode,
        description,
        location: location.trim() || shipment.destination_country || "ParcelPilot facility",
      })
      .select(`id, shipment_id, status, status_code, description, location, created_at`)
      .single();

    if (eventError) {
      console.error("Event creation error:", eventError);
      setError("Shipment status changed, but the tracking event could not be created.");
      setUpdating(false);
      return;
    }

    setShipment({ ...shipment, status, status_code: statusCode });

    if (newEvent) {
      setEvents((currentEvents) => [newEvent, ...currentEvents]);
    }

    setLocation("");

    // Send a customer notification after the database update succeeds.
    try {
      const notificationResponse = await fetch(
        "/api/notifications/status-updated",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerEmail: shipment.customer_email,
            receiverEmail: shipment.customer_email,
            trackingNumber: shipment.tracking_number,
            receiverName: shipment.receiver_name,
            originCountry: shipment.origin_country,
            destinationCountry: shipment.destination_country,
            status,
            statusCode,
            description,
            location:
              location.trim() ||
              shipment.destination_country ||
              "ParcelPilot facility",
          }),
        }
      );

      const rawResponse = await notificationResponse.text();

      let notificationData: {
        success?: boolean;
        error?: string;
      } = {};

      try {
        notificationData = rawResponse
          ? JSON.parse(rawResponse)
          : {};
      } catch {
        notificationData = {
          success: false,
          error: rawResponse || "Email service returned an empty response.",
        };
      }

      if (!notificationResponse.ok || notificationData.success !== true) {
        console.error(
          "STATUS EMAIL FAILED:",
          notificationData.error || rawResponse
        );

        setMessage(
          `Shipment ${shipment.tracking_number} updated to "${status}", but the customer email could not be sent.`
        );
      } else {
        setMessage(
          `Shipment ${shipment.tracking_number} updated to "${status}" and the customer was notified by email.`
        );
      }
    } catch (emailError) {
      console.error("STATUS EMAIL REQUEST FAILED:", emailError);

      setMessage(
        `Shipment ${shipment.tracking_number} updated to "${status}", but the customer email could not be sent.`
      );
    }

    setUpdating(false);
  }

  // NEW: geocode a place name the same way create-shipment does
  async function geocodePlace(place: string) {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(place)}`);
    const data = await response.json();

    if (!response.ok || !Array.isArray(data) || data.length === 0) {
      throw new Error(`Could not find a location for "${place}".`);
    }

    const result = data[0];
    const lat = Number(result.lat);
    const lon = Number(result.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error(`The location service returned an invalid position for "${place}".`);
    }

    return { latitude: lat, longitude: lon, name: result.display_name?.trim() || place };
  }

  // NEW: add a manual tracking location and move the map marker
  async function addLocation() {
    if (!shipment) return;

    setLocationError("");
    setLocationMessage("");

    const manualLat = latInput.trim() ? Number(latInput) : null;
    const manualLng = lngInput.trim() ? Number(lngInput) : null;

    if ((manualLat !== null && !Number.isFinite(manualLat)) || (manualLng !== null && !Number.isFinite(manualLng))) {
      setLocationError("Latitude and longitude must be valid numbers.");
      return;
    }

    if ((manualLat !== null) !== (manualLng !== null)) {
      setLocationError("Enter both latitude and longitude, or leave both blank to use the place name instead.");
      return;
    }

    if (manualLat === null && !placeInput.trim()) {
      setLocationError("Enter a place name, or exact coordinates.");
      return;
    }

    setSavingLocation(true);

    try {
      let latitude: number;
      let longitude: number;
      let locationName: string;

      if (manualLat !== null && manualLng !== null) {
        latitude = manualLat;
        longitude = manualLng;
        locationName = placeInput.trim() || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } else {
        const geocoded = await geocodePlace(placeInput.trim());
        latitude = geocoded.latitude;
        longitude = geocoded.longitude;
        locationName = geocoded.name;
      }

      const { error: insertError } = await supabase.from("tracking_locations").insert({
        shipment_id: shipment.id,
        latitude,
        longitude,
        location_name: locationName,
        recorded_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new Error(insertError.message || "Unable to save this location.");
      }

      const { error: shipmentUpdateError } = await supabase
        .from("shipments")
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shipment.id);

      if (shipmentUpdateError) {
        console.error("Shipment coordinate update error:", shipmentUpdateError);
      }

      setShipment({ ...shipment, current_latitude: latitude, current_longitude: longitude });
      setPlaceInput("");
      setLatInput("");
      setLngInput("");
      setLocationMessage(`Location updated to "${locationName}".`);
    } catch (locationErr) {
      console.error("Add location error:", locationErr);
      setLocationError(locationErr instanceof Error ? locationErr.message : "Unable to save this location.");
    } finally {
      setSavingLocation(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="text-slate-500">Loading shipment...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !shipment) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">
              Unable to Load Shipment
            </h1>

            <p className="mt-3 text-slate-600">
              {error}
            </p>

            <p className="mt-3 text-xs text-slate-400 break-all">
              Shipment ID:{" "}
              {new URLSearchParams(window.location.search).get("shipment") ||
                "not provided"}
            </p>

            <Link
              href="/operations"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Operations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!trackingNumber) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              No Shipment Selected
            </h1>

            <p className="mt-3 text-slate-500">
              Please select a shipment from the Operations page.
            </p>

            <Link
              href="/operations"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Operations
            </Link>
          </div>
        </div>
      </main>
    );
  }
  // NEW: coordinates for the live preview map
  const originCoord =
    shipment?.origin_latitude != null && shipment?.origin_longitude != null
      ? { latitude: Number(shipment.origin_latitude), longitude: Number(shipment.origin_longitude) }
      : null;

  const currentCoord =
    shipment?.current_latitude != null && shipment?.current_longitude != null
      ? { latitude: Number(shipment.current_latitude), longitude: Number(shipment.current_longitude) }
      : null;

  const destinationCoord =
    shipment?.destination_latitude != null && shipment?.destination_longitude != null
      ? { latitude: Number(shipment.destination_latitude), longitude: Number(shipment.destination_longitude) }
      : null;

  const routeCoords = locations
    .filter((loc) => loc.latitude != null && loc.longitude != null)
    .map((loc) => ({ latitude: Number(loc.latitude), longitude: Number(loc.longitude) }))
    .reverse(); // oldest first for a sensible route line

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ParcelPilot Logistics</h1>
            <p className="text-sm text-slate-500">Shipment Management</p>
          </div>
          <div className="flex gap-3">
            <Link href="/operations" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Operations
            </Link>
            {shipment && (
              <Link
                href={`/track/${encodeURIComponent(shipment.tracking_number)}`}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Customer Tracking
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tracking Number</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">{shipment?.tracking_number}</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2">
              <span className="text-sm font-semibold text-slate-700">{shipment?.status}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Receiver</p>
              <p className="mt-1 font-semibold text-slate-900">{shipment?.receiver_name || "Not assigned"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Route</p>
              <p className="mt-1 font-semibold text-slate-900">
                {shipment?.origin_country || "Origin"} → {shipment?.destination_country || "Destination"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Service</p>
              <p className="mt-1 font-semibold text-slate-900">{shipment?.service_type || "Standard"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Weight</p>
              <p className="mt-1 font-semibold text-slate-900">
                {shipment?.package_weight ? `${shipment.package_weight} kg` : "Not specified"}
              </p>
            </div>
          </div>
        </section>

        {/* NEW: Set Current Location */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Set Current Location</h2>
            <p className="mt-1 text-sm text-slate-500">
              Move the shipment's position on the map. Type a place name, or enter exact coordinates.
            </p>
          </div>

          {locationMessage && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {locationMessage}
            </div>
          )}

          {locationError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {locationError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-2 block text-sm font-bold text-slate-900">Place Name</label>
              <input
                type="text"
                value={placeInput}
                onChange={(e) => setPlaceInput(e.target.value)}
                placeholder="Example: Dubai, UAE"
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Latitude (optional)</label>
              <input
                type="text"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="Example: 25.2048"
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">Longitude (optional)</label>
              <input
                type="text"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                placeholder="Example: 55.2708"
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <p className="mt-3 text-sm font-medium text-slate-600">
            Fill in only the place name to auto-locate it, or fill in latitude + longitude for an exact position
            (the place name becomes just a label if you use both).
          </p>

          <button
            type="button"
            onClick={addLocation}
            disabled={savingLocation}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingLocation ? "Saving Location..." : "Update Map Location"}
          </button>

          {/* Live preview map */}
          {shipment && (
            <div className="mt-6">
              <ShipmentMap
                originLocation={originCoord}
                currentLocation={currentCoord}
                destination={destinationCoord}
                route={routeCoords}
                shippingMode={shipment.shipping_mode}
                serviceType={shipment.service_type}
                originAirport={null}
                destinationAirport={null}
                status={shipment.status}
                flightNumber={shipment.flight_number}
                awbNumber={shipment.awb_number}
                trackingNumber={shipment.tracking_number}
                originCountry={shipment.origin_country}
                destinationCountry={shipment.destination_country}
              />
            </div>
          )}

          {/* Location history */}
          {locations.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Location History
              </p>
              <div className="space-y-2">
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-900">{loc.location_name || "Unnamed location"}</span>
                    <span className="text-xs text-slate-500">
                      {loc.recorded_at ? new Date(loc.recorded_at).toLocaleString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Update Shipment Status</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Changing the status will also create a tracking history event.
                </p>
              </div>

              {message && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Shipment Status</label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.code} value={item.status}>
                        {item.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Status Code</label>
                  <input
                    type="text"
                    value={statusCode}
                    readOnly
                    className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-base font-semibold text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Event Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Example: Warsaw Airport"
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Event Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-500 placeholder:font-medium outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={updateShipment}
                  disabled={updating}
                  className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating Shipment..." : "Update Shipment"}
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Shipment Details</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Shipping Mode</p>
                  <p className="mt-1 font-semibold text-slate-900">{shipment?.shipping_mode || "Air Freight"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Flight</p>
                  <p className="mt-1 font-semibold text-slate-900">{shipment?.flight_number || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">AWB</p>
                  <p className="mt-1 font-semibold text-slate-900">{shipment?.awb_number || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Sender</p>
                  <p className="mt-1 font-semibold text-slate-900">{shipment?.sender_name || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Receiver</p>
                  <p className="mt-1 font-semibold text-slate-900">{shipment?.receiver_name || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Packages</p>
                  <p className="mt-1 font-semibold text-slate-900">{shipment?.package_count || 1}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Tracking History</h2>
            <p className="mt-1 text-sm text-slate-500">Every shipment status update is recorded here.</p>
          </div>

          {events.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
              No tracking events have been recorded yet.
            </div>
          ) : (
            <div className="relative">
              <div className="space-y-6">
                {events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                        ✓
                      </div>
                      {index < events.length - 1 && (
                        <div className="mt-2 h-full min-h-10 w-px bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-2">
                      <h3 className="font-bold text-slate-900">{event.status}</h3>
                      {event.status_code && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {event.status_code}
                        </p>
                      )}
                      {event.description && (
                        <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="mt-2 text-sm text-slate-500">📍 {event.location}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}