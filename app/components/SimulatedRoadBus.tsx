"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Props = {
  start: Coordinate | null;
  end: Coordinate | null;
  trackingNumber: string;
};

type LatLng = [number, number];

const busIcon = L.divIcon({
  className: "simulated-road-bus-icon",
  html: `
    <div style="
      width:132px;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:4px;
      overflow:visible;
      filter:drop-shadow(0 3px 5px rgba(0,0,0,.65));
    ">
      <div style="
        width:68px;
        height:52px;
        box-sizing:border-box;
        border:4px solid #111827;
        border-radius:12px;
        background:#facc15;
        color:#111827;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <svg width="48" height="36" viewBox="0 0 48 36"
             xmlns="http://www.w3.org/2000/svg" aria-label="Bus">
          <rect x="5" y="2" width="38" height="27" rx="5"
                fill="#facc15" stroke="#111827" stroke-width="3"/>
          <rect x="10" y="6" width="12" height="9" rx="1"
                fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
          <rect x="25" y="6" width="12" height="9" rx="1"
                fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
          <rect x="9" y="18" width="30" height="5" rx="1" fill="#111827"/>
          <circle cx="14" cy="29" r="4" fill="#111827" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="34" cy="29" r="4" fill="#111827" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      </div>
      <div style="
        background:#111827;
        color:#facc15;
        border:2px solid #facc15;
        border-radius:6px;
        padding:4px 7px;
        white-space:nowrap;
        font:900 11px/1.2 Arial,sans-serif;
      ">PARCELPILOT BUS</div>
    </div>
  `,
  iconSize: [132, 88],
  iconAnchor: [66, 28],
  tooltipAnchor: [0, -30],
});

export default function SimulatedRoadBus({
  start,
  end,
  trackingNumber,
}: Props) {
  const map = useMap();
  const [road, setRoad] = useState<LatLng[]>([]);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [message, setMessage] = useState("Loading road route…");

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    setRoad([]);
    setPosition(null);
    setMessage("Loading road route…");

    const startPoint = start;
    const endPoint = end;

    if (
      !startPoint ||
      !endPoint ||
      !Number.isFinite(startPoint.latitude) ||
      !Number.isFinite(startPoint.longitude) ||
      !Number.isFinite(endPoint.latitude) ||
      !Number.isFinite(endPoint.longitude) ||
      Math.abs(startPoint.latitude) > 90 ||
      Math.abs(endPoint.latitude) > 90 ||
      Math.abs(startPoint.longitude) > 180 ||
      Math.abs(endPoint.longitude) > 180
    ) {
      setMessage("Simulation unavailable — valid origin and destination coordinates are required");
      return;
    }

    // Preserve validated coordinates inside the asynchronous route loader.
    if (!startPoint || !endPoint) return;

    const validStart: Coordinate = {
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
    };
    const validEnd: Coordinate = {
      latitude: endPoint.latitude,
      longitude: endPoint.longitude,
    };

    const controller = new AbortController();

    async function loadRoadRoute() {
      try {
        const url =
          "https://router.project-osrm.org/route/v1/driving/" +
          `${validStart.longitude},${validStart.latitude};${validEnd.longitude},${validEnd.latitude}` +
          "?overview=full&geometries=geojson&steps=false";

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Road routing service unavailable");
        }

        const data = await response.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;

        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          throw new Error("No drivable road route was returned");
        }

        const points: LatLng[] = coordinates
          .filter(
            (point: unknown) =>
              Array.isArray(point) &&
              point.length >= 2 &&
              Number.isFinite(point[0]) &&
              Number.isFinite(point[1])
          )
          .map((point: number[]) => [point[1], point[0]]);

        if (points.length < 2 || cancelled) {
          if (!cancelled) {
            setMessage("No road route available for simulation");
          }
          return;
        }

        setRoad(points);
        setPosition(points[0]);
        setMessage("Road route loaded");

        map.fitBounds(points, { padding: [55, 55], maxZoom: 13 });

        const lengths: number[] = [0];
        let total = 0;

        for (let i = 1; i < points.length; i++) {
          const a = L.latLng(points[i - 1][0], points[i - 1][1]);
          const b = L.latLng(points[i][0], points[i][1]);
          total += a.distanceTo(b);
          lengths.push(total);
        }

        if (total <= 0) {
          return;
        }

        // Move from origin to destination once, then remain at the destination.
        const duration = 300_000;
        let startTime: number | null = null;

        const animate = (time: number) => {
          if (cancelled) return;
          if (startTime === null) startTime = time;

          const progress = Math.min((time - startTime) / duration, 1);
          const targetDistance = progress * total;

          let index = 1;
          while (
            index < lengths.length - 1 &&
            lengths[index] < targetDistance
          ) {
            index++;
          }

          const previousDistance = lengths[index - 1];
          const segmentDistance = lengths[index] - previousDistance;
          const segmentProgress =
            segmentDistance > 0
              ? Math.min(1, Math.max(0, (targetDistance - previousDistance) / segmentDistance))
              : 0;

          const a = points[index - 1];
          const b = points[index];

          setPosition([
            a[0] + (b[0] - a[0]) * segmentProgress,
            a[1] + (b[1] - a[1]) * segmentProgress,
          ]);

          if (progress < 1) {
            frame = window.requestAnimationFrame(animate);
          }
        };

        frame = window.requestAnimationFrame(animate);
      } catch (error) {
        if (!cancelled) {
          console.error("Simulated road bus:", error);
          setMessage("Simulation unavailable — road route could not load");
        }
      }
    }

    void loadRoadRoute();

    return () => {
      cancelled = true;
      controller.abort();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [
    start?.latitude,
    start?.longitude,
    end?.latitude,
    end?.longitude,
    map,
  ]);

  return (
    <>
      {road.length > 1 && (
        <>
          <Polyline
            positions={road}
            pathOptions={{
              color: "#ffffff",
              weight: 11,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          <Polyline
            positions={road}
            pathOptions={{
              color: "#2563eb",
              weight: 6,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {position && (
        <>
          <CircleMarker
            center={position}
            radius={19}
            pathOptions={{
              color: "#111827",
              weight: 5,
              opacity: 1,
              fillColor: "#facc15",
              fillOpacity: 0.95,
            }}
            pane="markerPane"
            bubblingMouseEvents={false}
          >
            <Tooltip permanent direction="bottom">
              <span style={{ fontWeight: 900, color: "#111827" }}>
                BUS POSITION
              </span>
            </Tooltip>
          </CircleMarker>

          <Marker
            position={position}
            icon={busIcon}
            zIndexOffset={10000}
            riseOnHover
            pane="markerPane"
            interactive
          >
            <Tooltip direction="top" offset={[0, -28]} permanent>
              <span style={{ fontWeight: 900 }}>
                PARCELPILOT BUS
              </span>
            </Tooltip>
          </Marker>
        </>
      )}

    </>
  );
}
