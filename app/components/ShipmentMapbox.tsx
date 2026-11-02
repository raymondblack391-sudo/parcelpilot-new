"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Coordinate = { latitude: number; longitude: number };
type LatLng = [number, number];
type LegKind = "road" | "air" | "sea";
type VehicleKind = "plane" | "bus" | "truck" | "ship" | "person" | "delivered";
type Leg = { key: string; phase: "done" | "todo"; kind: LegKind; from: LatLng; to: LatLng };

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
  originCountry?: string | null;
  destinationCountry?: string | null;
};

export type ShipmentMapProps = Props;

const STYLES = {
  map: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

const VEHICLE_COLOR: Record<VehicleKind, string> = {
  plane: "#7c3aed", bus: "#ca8a04", truck: "#2563eb", ship: "#0891b2", person: "#16a34a", delivered: "#16a34a",
};
const VEHICLE_LABEL: Record<VehicleKind, string> = {
  plane: "AIRCRAFT", bus: "BUS", truck: "TRUCK", ship: "VESSEL", person: "DELIVERY", delivered: "DELIVERED",
};
const VEHICLE_SVG: Record<VehicleKind, string> = {
  plane: `<svg viewBox="0 0 24 24" width="30" height="30"><path fill="#1e293b" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
  bus: `<svg viewBox="0 0 48 36" width="34" height="26"><rect x="5" y="2" width="38" height="27" rx="5" fill="#facc15" stroke="#111827" stroke-width="3"/><rect x="10" y="6" width="12" height="9" rx="1" fill="#fff" stroke="#111827" stroke-width="1.5"/><rect x="25" y="6" width="12" height="9" rx="1" fill="#fff" stroke="#111827" stroke-width="1.5"/><rect x="9" y="18" width="30" height="5" rx="1" fill="#111827"/><rect x="41" y="20" width="4" height="4" fill="#fff" stroke="#111827"/><circle cx="14" cy="29" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/><circle cx="34" cy="29" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/></svg>`,
  truck: `<svg viewBox="0 0 48 32" width="34" height="23"><rect x="2" y="4" width="28" height="18" rx="2" fill="#2563eb" stroke="#111827" stroke-width="2.5"/><path d="M30 10h10l6 7v5H30z" fill="#facc15" stroke="#111827" stroke-width="2.5" stroke-linejoin="round"/><circle cx="12" cy="25" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/><circle cx="38" cy="25" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/></svg>`,
  ship: `<svg viewBox="0 0 32 24" width="30" height="22"><path d="M2 14h28l-4 8H6z" fill="#0f766e" stroke="#111827" stroke-width="2" stroke-linejoin="round"/><rect x="9" y="7" width="14" height="7" fill="#fff" stroke="#111827" stroke-width="2"/><rect x="13" y="2" width="6" height="5" fill="#dc2626" stroke="#111827" stroke-width="1.5"/></svg>`,
  person: `<svg viewBox="0 0 32 32" width="30" height="30"><circle cx="12" cy="6" r="4" fill="#1e293b"/><rect x="7" y="11" width="10" height="10" rx="3" fill="#16a34a"/><path d="M9 21l-2 9M15 21l2 9" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/><rect x="17" y="13" width="12" height="10" rx="1.5" fill="#f59e0b" stroke="#1e293b" stroke-width="2"/><path d="M17 18h12" stroke="#1e293b" stroke-width="2"/></svg>`,
  delivered: `<svg viewBox="0 0 24 24" width="28" height="28"><path d="M5 13l4 4L19 7" fill="none" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

function norm(c: Coordinate | null | undefined): Coordinate | null {
  if (!c || c.latitude == null || c.longitude == null) return null;
  const latitude = Number(c.latitude);
  const longitude = Number(c.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

const ll = (c: Coordinate): LatLng => [c.latitude, c.longitude];
const lnglat = (p: LatLng): [number, number] => [p[1], p[0]];
const esc = (v: string) =>
  v.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string));

function km(a: LatLng, b: LatLng) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b[0] - a[0]);
  const dLng = r(b[1] - a[1]);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function bearing(a: LatLng, b: LatLng) {
  const r = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(r(b[1] - a[1])) * Math.cos(r(b[0]));
  const x = Math.cos(r(a[0])) * Math.sin(r(b[0])) - Math.sin(r(a[0])) * Math.cos(r(b[0])) * Math.cos(r(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function arc(a: LatLng, b: LatLng, bend: number, steps = 56): LatLng[] {
  const dLat = b[0] - a[0];
  const dLng = b[1] - a[1];
  let p: LatLng = [-dLng, dLat];
  if (p[0] < 0) p = [-p[0], -p[1]];
  const c: LatLng = [(a[0] + b[0]) / 2 + p[0] * bend, (a[1] + b[1]) / 2 + p[1] * bend];
  const pts: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return pts;
}

const roadCache = new Map<string, LatLng[]>();

async function fetchRoad(a: LatLng, b: LatLng, signal: AbortSignal): Promise<LatLng[]> {
  const key = `${a[0].toFixed(4)},${a[1].toFixed(4)};${b[0].toFixed(4)},${b[1].toFixed(4)}`;
  const hit = roadCache.get(key);
  if (hit) return hit;
  const overview = km(a, b) > 300 ? "simplified" : "full";
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=${overview}&geometries=geojson`,
    { signal }
  );
  if (!res.ok) throw new Error("Road routing unavailable");
  const data = await res.json();
  const coords = data?.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) throw new Error("No road route");
  const pts = coords.map((p: number[]) => [p[1], p[0]] as LatLng);
  roadCache.set(key, pts);
  return pts;
}

function useLegPaths(legs: Leg[]) {
  const [paths, setPaths] = useState<Record<string, LatLng[]>>({});
  const sig = legs.map((l) => l.key).join("|");
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    legs
      .filter((l) => l.kind === "road" && km(l.from, l.to) > 0.3 && km(l.from, l.to) < 2500)
      .slice(0, 14)
      .forEach(async (leg) => {
        try {
          const pts = await fetchRoad(leg.from, leg.to, controller.signal);
          if (!cancelled) setPaths((prev) => ({ ...prev, [leg.key]: pts }));
        } catch {
          // keeps the straight-line fallback
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return paths;
}

function pickVehicle(args: {
  status: string | null; mode: string; isAir: boolean; isSea: boolean; delivered: boolean; distToDest: number | null;
}): VehicleKind {
  const s = (args.status ?? "").toLowerCase();
  if (args.delivered) return "delivered";
  if (/out for delivery|last.?mile|with courier|delivery (rider|agent)|on delivery/.test(s)) return "person";
  if (args.distToDest !== null && args.distToDest < 15 && !/customs|clearance/.test(s)) return "person";
  if (args.isSea) return "ship";
  if (args.isAir) {
    if (/pending|created|registered|processing|picked|pick up|collected|received|warehouse|hub|customs|clearance|arrived|hold|held/.test(s))
      return "truck";
    return "plane";
  }
  return /truck|freight|cargo/.test(args.mode) ? "truck" : "bus";
}

function transformFor(kind: VehicleKind, unwrapped: number, raw: number) {
  if (kind === "plane") return `rotate(${unwrapped}deg)`;
  if (kind === "bus" || kind === "truck" || kind === "ship") return `scaleX(${raw > 180 ? -1 : 1})`;
  return "none";
}

function vehicleInner(kind: VehicleKind, transform: string) {
  const color = VEHICLE_COLOR[kind];
  return `<span class="pp-pulse" style="border-color:${color}"></span><div class="pp-veh-rot" style="transform:${transform}"><div class="pp-badge" style="border-color:${color}">${VEHICLE_SVG[kind]}</div></div><div class="pp-veh-label" style="background:${color}">${VEHICLE_LABEL[kind]}</div>`;
}

function pinEl(letter: string, label: string, labelColor: string) {
  const el = document.createElement("div");
  el.style.cssText = "position:relative;width:34px;height:44px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.4));cursor:pointer;";
  el.innerHTML = `<svg viewBox="0 0 34 44" width="34" height="44"><path d="M17 1C8.7 1 2 7.7 2 16c0 11 15 27 15 27s15-16 15-27C32 7.7 25.3 1 17 1z" fill="#dc2626" stroke="#fff" stroke-width="2.5"/></svg><span style="position:absolute;top:7px;left:0;width:34px;text-align:center;color:#fff;font:800 14px/18px Arial,sans-serif;">${letter}</span><div style="position:absolute;bottom:50px;left:50%;transform:translateX(-50%);background:${labelColor};color:#fff;font:700 11px/1 Arial,sans-serif;padding:4px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3);">${esc(label)}</div>`;
  return el;
}

function airportEl(label: string) {
  const el = document.createElement("div");
  el.innerHTML = `<div style="width:30px;height:30px;border-radius:50%;background:#475569;border:3px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,.3);">✈</div><div style="position:absolute;top:34px;left:50%;transform:translateX(-50%);background:#475569;color:#fff;font:700 10px/1 Arial,sans-serif;padding:3px 8px;border-radius:999px;white-space:nowrap;">${esc(label)}</div>`;
  el.style.position = "relative";
  return el;
}

function stageEl(kind: VehicleKind, label: string) {
  const color = VEHICLE_COLOR[kind];
  const el = document.createElement("div");
  el.style.cssText = "position:relative;width:40px;height:40px;";
  el.innerHTML = `<div class="pp-badge" style="width:40px;height:40px;border-color:${color}">${VEHICLE_SVG[kind]}</div><div class="pp-veh-label" style="top:44px;background:${color}">${label}</div>`;
  return el;
}

type Feature = {
  type: "Feature";
  properties: Record<string, string>;
  geometry: { type: "LineString"; coordinates: number[][] };
};
type FC = { type: "FeatureCollection"; features: Feature[] };

function addRouteLayers(map: mapboxgl.Map, data: FC) {
  if (!map.getSource("routes")) {
    map.addSource("routes", { type: "geojson", data: data as never });
  }
  const color = ["match", ["get", "kind"], "air", "#7c3aed", "sea", "#0891b2", "#2563eb"] as never;
  if (!map.getLayer("routes-casing")) {
    map.addLayer({
      id: "routes-casing", type: "line", source: "routes",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#ffffff", "line-width": 9, "line-opacity": 0.9 },
    });
  }
  if (!map.getLayer("routes-done")) {
    map.addLayer({
      id: "routes-done", type: "line", source: "routes",
      filter: ["==", ["get", "phase"], "done"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": color, "line-width": 5 },
    });
  }
  if (!map.getLayer("routes-todo")) {
    map.addLayer({
      id: "routes-todo", type: "line", source: "routes",
      filter: ["==", ["get", "phase"], "todo"],
      layout: { "line-join": "round" },
      paint: { "line-color": color, "line-width": 4, "line-opacity": 0.85, "line-dasharray": [2, 2] },
    });
  }
}

export default function ShipmentMapbox(props: Props) {
  const {
    route, shippingMode, serviceType, originAirport, destinationAirport, status,
    flightNumber, awbNumber, trackingNumber, originCountry = null, destinationCountry = null,
  } = props;

  const o = norm(props.originLocation);
  const c = norm(props.currentLocation);
  const d = norm(props.destination);
  const oa = norm(props.originAirportLocation);
  const da = norm(props.destinationAirportLocation);
  const routePts = (route ?? []).map((p) => norm(p)).filter((p): p is Coordinate => p !== null);

  const mode = [shippingMode, serviceType].filter(Boolean).join(" ").toLowerCase();
  const isAir = /\bair/.test(mode);
  const isSea = /\b(sea|ocean|vessel|ship)/.test(mode);
  const s = (status ?? "").toLowerCase();
  const delivered = /\bdelivered\b/.test(s) && !/not delivered|undelivered/.test(s);

  const trail: LatLng[] = [];
  const push = (p: Coordinate | null | undefined) => {
    if (!p) return;
    const q = ll(p);
    const last = trail[trail.length - 1];
    if (!last || last[0] !== q[0] || last[1] !== q[1]) trail.push(q);
  };
  push(o);
  routePts.forEach((p) => push(p));
  push(delivered ? d : c);

  const vehicle: LatLng | null = delivered && d ? ll(d) : c ? ll(c) : o ? ll(o) : null;
  const dest: LatLng | null = d ? ll(d) : null;

  const legs: Leg[] = [];
  const addLeg = (phase: Leg["phase"], kind: LegKind, from: LatLng, to: LatLng) => {
    if (km(from, to) < 0.05) return;
    legs.push({
      key: `${phase}:${kind}:${from[0].toFixed(5)},${from[1].toFixed(5)}>${to[0].toFixed(5)},${to[1].toFixed(5)}`,
      phase, kind, from, to,
    });
  };
  const baseKind = (a: LatLng, b: LatLng): LegKind => (isSea ? "sea" : isAir && km(a, b) > 150 ? "air" : "road");

  for (let i = 1; i < trail.length; i++) addLeg("done", baseKind(trail[i - 1], trail[i]), trail[i - 1], trail[i]);

  const from = trail.length ? trail[trail.length - 1] : null;
  if (!delivered && from && dest) {
    const oaP = oa ? ll(oa) : null;
    const daP = da ? ll(da) : null;
    if (isAir && oaP && daP && km(from, oaP) < 40 && km(oaP, daP) > 150) {
      addLeg("todo", "road", from, oaP);
      addLeg("todo", "air", oaP, daP);
      addLeg("todo", "road", daP, dest);
    } else if (isAir && daP && km(from, dest) > 150 && km(from, daP) > 20) {
      addLeg("todo", "air", from, daP);
      addLeg("todo", "road", daP, dest);
    } else {
      addLeg("todo", baseKind(from, dest), from, dest);
    }
  }

  const paths = useLegPaths(legs);
  const legsSig = legs.map((l) => l.key).join("|");
  const drawn = useMemo(
    () =>
      legs.map((l) => ({
        ...l,
        pts: l.kind === "air" ? arc(l.from, l.to, 0.18) : l.kind === "sea" ? arc(l.from, l.to, 0.08) : paths[l.key] ?? [l.from, l.to],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [legsSig, paths]
  );

  let heading = 90;
  const firstTodo = drawn.find((l) => l.phase === "todo");
  if (vehicle && firstTodo) heading = bearing(vehicle, firstTodo.pts[Math.min(3, firstTodo.pts.length - 1)]);
  else if (vehicle && dest) heading = bearing(vehicle, dest);

  const kind = pickVehicle({
    status, mode, isAir, isSea, delivered,
    distToDest: vehicle && dest ? km(vehicle, dest) : null,
  });

  const popupHtml =
    `<strong>${VEHICLE_LABEL[kind]}</strong><br/>Tracking: ${esc(trackingNumber)}<br/>Status: ${esc(status || "Status unavailable")}` +
    (vehicle ? `<br/>${vehicle[0].toFixed(4)}, ${vehicle[1].toFixed(4)}` : "");

  const fitPts: LatLng[] = [o, c, d, oa, da].filter((p): p is Coordinate => p !== null).map(ll);
  const fitSig = fitPts.map((p) => p.join(",")).join("|");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geoRef = useRef<FC>({ type: "FeatureCollection", features: [] });
  const staticRef = useRef<mapboxgl.Marker[]>([]);
  const vehRef = useRef<mapboxgl.Marker | null>(null);
  const posRef = useRef<LatLng | null>(null);
  const frameRef = useRef<number | null>(null);
  const kindRef = useRef<VehicleKind>(kind);
  const spinRef = useRef<number>(heading);
  const fitDone = useRef<string | null>(null);
  const fitRef = useRef<LatLng[]>(fitPts);
  fitRef.current = fitPts;

  const [ready, setReady] = useState(0);
  const [mapStyle, setMapStyle] = useState<"map" | "satellite">("map");
  const [fullscreen, setFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const firstRun = useRef(true);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const fitAll = (map: mapboxgl.Map, animate: boolean) => {
    const pts = fitRef.current;
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.easeTo({ center: lnglat(pts[0]), zoom: 6, duration: animate ? 800 : 0 });
      return;
    }
    const b = new mapboxgl.LngLatBounds();
    pts.forEach((p) => b.extend(lnglat(p)));
    map.fitBounds(b, { padding: 80, maxZoom: 8, duration: animate ? 800 : 0 });
  };

  // create the map once
  useEffect(() => {
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;
    const start = fitRef.current[0] ?? [0, 0];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLES.map,
      center: lnglat(start),
      zoom: 4,
      minZoom: 1.5,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");
    map.on("style.load", () => {
      addRouteLayers(map, geoRef.current);
      setReady((n) => n + 1);
    });
    map.on("error", (e) => {
      console.error("MAPBOX ERROR:", e?.error?.message || e?.error || e);
    });
    mapRef.current = map;
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      staticRef.current = [];
      vehRef.current = null;
      posRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // map / satellite switch
  const firstStyle = useRef(true);
  useEffect(() => {
    if (firstStyle.current) {
      firstStyle.current = false;
      return;
    }
    mapRef.current?.setStyle(STYLES[mapStyle]);
  }, [mapStyle]);

  // routes
  useEffect(() => {
    const map = mapRef.current;
    const fc: FC = {
      type: "FeatureCollection",
      features: drawn.map((l) => ({
        type: "Feature",
        properties: { phase: l.phase, kind: l.kind },
        geometry: { type: "LineString", coordinates: l.pts.map(lnglat) },
      })),
    };
    geoRef.current = fc;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("routes") as mapboxgl.GeoJSONSource | undefined;
    if (src) src.setData(fc as never);
  }, [drawn, ready]);

  // pins, airports and stage markers
  const staticSig = [o, d, oa, da].map((p) => (p ? `${p.latitude},${p.longitude}` : "-")).join("|") +
    `|${originCountry}|${destinationCountry}|${originAirport}|${destinationAirport}|${kind === "bus"}|${kind === "person" || kind === "delivered"}`;
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    staticRef.current.forEach((m) => m.remove());
    staticRef.current = [];
    const add = (m: mapboxgl.Marker) => {
      m.addTo(map);
      staticRef.current.push(m);
    };
    const popup = (html: string) => new mapboxgl.Popup({ offset: 30 }).setHTML(html);

    if (oa) add(new mapboxgl.Marker({ element: airportEl(originAirport || "Origin airport") }).setLngLat(lnglat(ll(oa))));
    if (da) add(new mapboxgl.Marker({ element: airportEl(destinationAirport || "Destination airport") }).setLngLat(lnglat(ll(da))));
    if (o) {
      add(new mapboxgl.Marker({ element: pinEl("O", originCountry ? `Origin · ${originCountry}` : "Origin", "#1d4ed8"), anchor: "bottom" })
        .setLngLat(lnglat(ll(o)))
        .setPopup(popup(`<strong>Shipment Origin</strong><br/>${o.latitude.toFixed(5)}, ${o.longitude.toFixed(5)}`)));
      if (kind !== "bus") add(new mapboxgl.Marker({ element: stageEl("bus", "PICKUP"), anchor: "bottom-left", offset: [16, 0] }).setLngLat(lnglat(ll(o))));
    }
    if (d) {
      add(new mapboxgl.Marker({ element: pinEl("D", destinationCountry ? `Destination · ${destinationCountry}` : "Destination", "#15803d"), anchor: "bottom" })
        .setLngLat(lnglat(ll(d)))
        .setPopup(popup(`<strong>Final Destination</strong><br/>${d.latitude.toFixed(5)}, ${d.longitude.toFixed(5)}`)));
      if (kind !== "person" && kind !== "delivered") add(new mapboxgl.Marker({ element: stageEl("person", "DELIVERY"), anchor: "bottom-right", offset: [-16, 0] }).setLngLat(lnglat(ll(d))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, staticSig]);

  // vehicle: create once
  const hasVehicle = !!vehicle;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !vehicle || vehRef.current) return;
    const el = document.createElement("div");
    el.className = "pp-veh";
    el.innerHTML = vehicleInner(kind, transformFor(kind, heading, heading));
    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat(lnglat(vehicle))
      .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(popupHtml))
      .addTo(map);
    marker.getElement().style.zIndex = "5";
    vehRef.current = marker;
    posRef.current = vehicle;
    kindRef.current = kind;
    spinRef.current = heading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hasVehicle]);

  // vehicle: icon kind and heading
  useEffect(() => {
    const marker = vehRef.current;
    if (!marker) return;
    const delta = ((heading - spinRef.current + 540) % 360) - 180;
    spinRef.current += delta;
    const tf = transformFor(kind, spinRef.current, heading);
    if (kindRef.current !== kind) {
      kindRef.current = kind;
      marker.getElement().innerHTML = vehicleInner(kind, tf);
    } else {
      const el = marker.getElement().querySelector<HTMLElement>(".pp-veh-rot");
      if (el) el.style.transform = tf;
    }
  }, [kind, heading, ready]);

  // vehicle: popup text
  useEffect(() => {
    vehRef.current?.getPopup()?.setHTML(popupHtml);
  }, [popupHtml]);

  // vehicle: glide to the new position
  useEffect(() => {
    const marker = vehRef.current;
    const map = mapRef.current;
    if (!marker || !map || !vehicle) return;
    const fromP = posRef.current ?? vehicle;
    const toP = vehicle;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (fromP[0] === toP[0] && fromP[1] === toP[1]) {
      marker.setLngLat(lnglat(toP));
      return;
    }
    const duration = Math.min(4000, 1200 + km(fromP, toP) * 4);
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const cur: LatLng = [fromP[0] + (toP[0] - fromP[0]) * e, fromP[1] + (toP[1] - fromP[1]) * e];
      marker.setLngLat(lnglat(cur));
      posRef.current = cur;
      if (p < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        posRef.current = toP;
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(step);
    if (!map.getBounds()?.contains(lnglat(toP))) map.easeTo({ center: lnglat(toP), duration: 1200 });
  }, [vehicle?.[0], vehicle?.[1], ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // fit the map to the shipment once per tracking number
  useEffect(() => {
    const map = mapRef.current;
    if (!map || fitPts.length === 0 || fitDone.current === trackingNumber) return;
    fitDone.current = trackingNumber;
    fitAll(map, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, trackingNumber, fitSig]);

  // resize when entering or leaving fullscreen
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.resize(), 150);
    return () => clearTimeout(t);
  }, [fullscreen]);

  // LIVE badge flash when position or status changes
  const posSig = `${vehicle?.[0] ?? ""},${vehicle?.[1] ?? ""}|${status ?? ""}`;
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setUpdatedAt(new Date());
  }, [posSig]);

  const hasAnything = !!(o || c || d);

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[3000] overflow-hidden bg-white"
          : "relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
      }
    >
      <style>{`
        .pp-veh{position:relative;width:48px;height:48px;}
        .pp-veh-rot{width:48px;height:48px;transition:transform .8s ease;}
        .pp-badge{width:48px;height:48px;box-sizing:border-box;border-radius:50%;background:#fff;border:3px solid;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.35);}
        .pp-pulse{position:absolute;inset:0;border-radius:50%;border:3px solid;opacity:0;animation:pp-pulse 2s ease-out infinite;pointer-events:none;}
        .pp-veh-label{position:absolute;top:54px;left:50%;transform:translateX(-50%);color:#fff;font:800 10px/1 Arial,sans-serif;letter-spacing:.06em;padding:4px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3);}
        @keyframes pp-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
        @keyframes pp-flash{0%{background:#bbf7d0}100%{background:rgba(255,255,255,.95)}}
        @keyframes pp-blink{0%,100%{opacity:1}50%{opacity:.3}}
        .pp-live-dot{width:8px;height:8px;border-radius:50%;background:#16a34a;animation:pp-blink 1.4s infinite;}
      `}</style>

      {token ? (
        <div ref={containerRef} className={fullscreen ? "h-screen w-full" : "h-[520px] w-full md:h-[640px]"} />
      ) : (
        <div className="flex h-[520px] items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-600">
          The map needs NEXT_PUBLIC_MAPBOX_TOKEN to be set.
        </div>
      )}

      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
        <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white text-sm font-semibold shadow-lg">
          <button type="button" onClick={() => setMapStyle("map")}
            className={"px-4 py-2 " + (mapStyle === "map" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100")}>Map</button>
          <button type="button" onClick={() => setMapStyle("satellite")}
            className={"px-4 py-2 " + (mapStyle === "satellite" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100")}>Satellite</button>
        </div>
        <button type="button" onClick={() => setFullscreen((v) => !v)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-lg hover:bg-slate-100">
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
        <div
          key={updatedAt ? updatedAt.getTime() : "initial"}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg"
          style={{ background: "rgba(255,255,255,.95)", animation: updatedAt ? "pp-flash 2.5s ease-out" : undefined }}
        >
          <span className="pp-live-dot" />
          LIVE{updatedAt ? ` · updated ${updatedAt.toLocaleTimeString()}` : ""}
        </div>
        <button type="button" onClick={() => mapRef.current && fitAll(mapRef.current, true)}
          className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg hover:bg-white">
          Show full route
        </button>
      </div>

      {isAir && (flightNumber || awbNumber) && (
        <div className="absolute left-4 top-4 z-10 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm font-bold text-slate-950">✈ Air Shipment</p>
          <p className="mt-1 text-xs text-slate-500">{shippingMode || "Air Freight"} · {serviceType || "Express Air"}</p>
          {flightNumber && <p className="mt-1 text-xs font-semibold text-slate-700">Flight: {flightNumber}</p>}
          {awbNumber && <p className="text-xs text-slate-500">AWB: {awbNumber}</p>}
        </div>
      )}

      <div className="absolute bottom-12 left-4 z-10">
        <button type="button" onClick={() => setShowLegend((v) => !v)}
          className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-lg">
          {showLegend ? "Hide legend" : "Legend"}
        </button>
        {showLegend && (
          <div className="mt-2 space-y-1.5 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs text-slate-700 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2"><span className="h-1.5 w-8 rounded-full bg-blue-600" />Road, covered</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-8 rounded-full bg-violet-600" />Flight, covered</div>
            <div className="flex items-center gap-2"><span className="w-8 border-t-4 border-dashed border-slate-500" />Remaining route</div>
            <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">O</span>Origin pin</div>
            <div className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">D</span>Destination pin</div>
          </div>
        )}
      </div>

      {!hasAnything && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-lg">
            <p className="font-semibold text-slate-900">Shipment location unavailable</p>
            <p className="mt-1 text-sm text-slate-500">Operational coordinates have not been published yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
