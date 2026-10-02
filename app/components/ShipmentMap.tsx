"use client";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Props = {
  originLocation?: Coordinate | null;
  currentLocation: Coordinate | null;
  destination: Coordinate | null;
  route: Coordinate[];
  shippingMode: string | null;
  serviceType: string | null;
  originAirport: string | null;
  destinationAirport: string | null;
  originAirportLocation?: Coordinate | null;
  destinationAirportLocation?: Coordinate | null;
  status: string | null;
  flightNumber: string | null;
  awbNumber: string | null;
  trackingNumber: string;
  // NEW: country names for on-map labels
  originCountry?: string | null;
  destinationCountry?: string | null;
};

function isValidCoordinate(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  return (
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180
  );
}

function toLatLng(coordinate: Coordinate): [number, number] {
  return [Number(coordinate.latitude), Number(coordinate.longitude)];
}

function createIcon(background: string, label: string) {
  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width:34px;
          height:34px;
          border-radius:50%;
          background:${background};
          border:3px solid white;
          box-shadow:0 3px 12px rgba(0,0,0,0.25);
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-weight:700;
          font-size:15px;
        "
      >
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

// NEW: vehicle icon matches shipping mode, larger + white bg so the emoji reads clearly
function createVehicleIcon(emoji: string) {
  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width:40px;
          height:40px;
          border-radius:50%;
          background:#ffffff;
          border:3px solid #0f172a;
          box-shadow:0 3px 14px rgba(0,0,0,0.35);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:20px;
        "
      >
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

// NEW: pick vehicle emoji from shipping mode
function getVehicleEmoji(shippingMode: string | null) {
  const mode = (shippingMode || "").toLowerCase();

  if (mode.includes("air")) return "✈️";
  if (mode.includes("sea")) return "🚢";
  if (mode.includes("road")) return "🚌";
  if (mode.includes("express")) return "🚀";

  return "📦";
}

const originIcon = createIcon("#2563eb", "O");
const destinationIcon = createIcon("#16a34a", "D");

type MapBoundsProps = {
  points: Coordinate[];
};

function MapBounds({ points }: MapBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter((point) =>
      isValidCoordinate(point.latitude, point.longitude)
    );

    if (validPoints.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(validPoints.map((point) => toLatLng(point)));

    if (validPoints.length === 1) {
      map.setView(toLatLng(validPoints[0]), 6);
      return;
    }

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 8,
    });
  }, [map, points]);

  return null;
}

type RouteLineProps = {
  points: Coordinate[];
  originCountry?: string | null;
  destinationCountry?: string | null;
};

function RouteLine({ points, originCountry, destinationCountry }: RouteLineProps) {
  const validPoints = points.filter((point) =>
    isValidCoordinate(point.latitude, point.longitude)
  );

  if (validPoints.length < 2) {
    return null;
  }

  const routeLabel =
    originCountry && destinationCountry
      ? `${originCountry} → ${destinationCountry}`
      : null;

  return (
    <Polyline
      positions={validPoints.map(toLatLng)}
      pathOptions={{
        color: "#2563eb",
        weight: 4,
        opacity: 0.75,
        dashArray: "8 8",
      }}
    >
      {routeLabel && (
        <Tooltip permanent direction="center" className="route-label-tooltip">
          {routeLabel}
        </Tooltip>
      )}
    </Polyline>
  );
}

export default function ShipmentMap({
  originLocation = null,
  currentLocation,
  destination,
  route,
  shippingMode,
  serviceType,
  originAirport,
  destinationAirport,
  originAirportLocation = null,
  destinationAirportLocation = null,
  status,
  flightNumber,
  awbNumber,
  trackingNumber,
  originCountry = null,
  destinationCountry = null,
}: Props) {
  const safeOrigin =
    originLocation && isValidCoordinate(originLocation.latitude, originLocation.longitude)
      ? originLocation
      : null;

  const safeCurrent =
    currentLocation && isValidCoordinate(currentLocation.latitude, currentLocation.longitude)
      ? currentLocation
      : null;

  const safeDestination =
    destination && isValidCoordinate(destination.latitude, destination.longitude)
      ? destination
      : null;

  const safeRoute = route.filter((point) =>
    isValidCoordinate(point.latitude, point.longitude)
  );

  const routePoints: Coordinate[] = [];

  if (safeOrigin) {
    routePoints.push(safeOrigin);
  }

  for (const point of safeRoute) {
    routePoints.push(point);
  }

  if (
    safeCurrent &&
    !routePoints.some(
      (point) =>
        point.latitude === safeCurrent.latitude &&
        point.longitude === safeCurrent.longitude
    )
  ) {
    routePoints.push(safeCurrent);
  }

  if (safeDestination) {
    routePoints.push(safeDestination);
  }

  const mapPoints: Coordinate[] = [
    ...(safeOrigin ? [safeOrigin] : []),
    ...(safeCurrent ? [safeCurrent] : []),
    ...(safeDestination ? [safeDestination] : []),
    ...safeRoute,
  ];

  let initialCenter: [number, number] = [0, 0];

  if (safeCurrent) {
    initialCenter = toLatLng(safeCurrent);
  } else if (safeOrigin) {
    initialCenter = toLatLng(safeOrigin);
  } else if (safeDestination) {
    initialCenter = toLatLng(safeDestination);
  }

  const hasAirShipment =
    shippingMode?.toLowerCase().includes("air") ||
    serviceType?.toLowerCase().includes("air");

  const vehicleEmoji = getVehicleEmoji(shippingMode);
  const vehicleIcon = createVehicleIcon(vehicleEmoji);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <style>{`
        .country-label-tooltip {
          background: rgba(15, 23, 42, 0.9) !important;
          border: none !important;
          color: white !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          padding: 4px 10px !important;
          border-radius: 999px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        }
        .route-label-tooltip {
          background: rgba(37, 99, 235, 0.92) !important;
          border: none !important;
          color: white !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          padding: 3px 9px !important;
          border-radius: 999px !important;
        }
      `}</style>

      <MapContainer
        center={initialCenter}
        zoom={4}
        scrollWheelZoom={true}
        className="h-[500px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds points={mapPoints} />

        <RouteLine
          points={routePoints}
          originCountry={originCountry}
          destinationCountry={destinationCountry}
        />

        {safeOrigin && (
          <Marker position={toLatLng(safeOrigin)} icon={originIcon}>
            {originCountry && (
              <Tooltip permanent direction="top" className="country-label-tooltip">
                {originCountry}
              </Tooltip>
            )}
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-bold text-slate-900">Shipment Origin</p>
                {originCountry && (
                  <p className="mt-1 text-sm font-semibold text-blue-700">{originCountry}</p>
                )}
                <p className="mt-1 text-sm text-slate-600">
                  {safeOrigin.latitude.toFixed(5)}, {safeOrigin.longitude.toFixed(5)}
                </p>
                <p className="mt-2 text-xs text-slate-500">Operator-controlled origin</p>
              </div>
            </Popup>
          </Marker>
        )}

        {safeCurrent && (
          <Marker position={toLatLng(safeCurrent)} icon={vehicleIcon}>
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-bold text-slate-900">Current Shipment Location</p>
                <p className="mt-1 text-sm text-slate-600">
                  {safeCurrent.latitude.toFixed(5)}, {safeCurrent.longitude.toFixed(5)}
                </p>
                <p className="mt-2 text-sm font-semibold text-blue-700">
                  {status || "Shipment in transit"}
                </p>
                <p className="mt-2 text-xs text-slate-500">Tracking: {trackingNumber}</p>
                <p className="mt-1 text-xs text-slate-500">Operational location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {safeDestination && (
          <Marker position={toLatLng(safeDestination)} icon={destinationIcon}>
            {destinationCountry && (
              <Tooltip permanent direction="top" className="country-label-tooltip">
                {destinationCountry}
              </Tooltip>
            )}
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-bold text-slate-900">Final Destination</p>
                {destinationCountry && (
                  <p className="mt-1 text-sm font-semibold text-green-700">
                    {destinationCountry}
                  </p>
                )}
                <p className="mt-1 text-sm text-slate-600">
                  {safeDestination.latitude.toFixed(5)}, {safeDestination.longitude.toFixed(5)}
                </p>
                <p className="mt-2 text-xs text-slate-500">Shipment destination</p>
              </div>
            </Popup>
          </Marker>
        )}

        {safeRoute.map((point, index) => (
          <CircleMarker
            key={`${point.latitude}-${point.longitude}-${index}`}
            center={toLatLng(point)}
            radius={4}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#2563eb",
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div>
                <p className="font-semibold text-slate-900">Operational Route Point</p>
                <p className="mt-1 text-xs text-slate-500">
                  {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {hasAirShipment && (
        <div className="absolute left-4 top-4 z-[1000] max-w-sm rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg text-indigo-700">
              ✈
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950">Air Shipment</p>
              <p className="mt-1 text-xs text-slate-500">
                {shippingMode || "Air Freight"} · {serviceType || "Express Air"}
              </p>
              {flightNumber && (
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  Flight: {flightNumber}
                </p>
              )}
              {awbNumber && (
                <p className="mt-1 text-xs text-slate-500">AWB: {awbNumber}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Map Legend
        </p>
        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              O
            </span>
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-[12px]">
              {vehicleEmoji}
            </span>
            <span>Current location</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
              D
            </span>
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-blue-600" />
            <span>Operator route</span>
          </div>
        </div>
      </div>

      {!safeOrigin && !safeCurrent && !safeDestination && (
        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-white/80">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
            <p className="font-semibold text-slate-900">Shipment location unavailable</p>
            <p className="mt-1 text-sm text-slate-500">
              Operational coordinates have not been published yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}