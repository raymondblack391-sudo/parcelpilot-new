"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { cumulative, escapeHtml, pointAtFraction, type LatLng } from "./mapGeo";

export type VehicleKind = "plane" | "bus" | "delivery" | "ship";

type Props = {
  path: LatLng[];
  fraction: number;
  exact: LatLng | null;
  kind: VehicleKind;
  label: string;
  popupHtml: string;
};

type VehicleState = {
  fraction: number;
  angle: number;
  key: string;
  pos: LatLng;
};

const PLANE_SVG = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#0f172a" xmlns="http://www.w3.org/2000/svg" aria-label="Aircraft"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;

const BUS_SVG = `<svg width="34" height="26" viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg" aria-label="Bus"><rect x="5" y="2" width="38" height="27" rx="5" fill="#facc15" stroke="#111827" stroke-width="3"/><rect x="10" y="6" width="12" height="9" rx="1" fill="#fff" stroke="#111827" stroke-width="1.5"/><rect x="25" y="6" width="12" height="9" rx="1" fill="#fff" stroke="#111827" stroke-width="1.5"/><rect x="9" y="18" width="30" height="5" rx="1" fill="#111827"/><circle cx="14" cy="29" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/><circle cx="34" cy="29" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/></svg>`;

function glyphFor(kind: VehicleKind): string {
  if (kind === "plane") return PLANE_SVG;
  if (kind === "bus") return BUS_SVG;
  if (kind === "delivery") return `<span style="font-size:26px;line-height:1">🛵</span>`;
  return `<span style="font-size:26px;line-height:1">🚢</span>`;
}

function buildIcon(kind: VehicleKind, label: string): L.DivIcon {
  return L.divIcon({
    className: "pp-vehicle",
    html:
      `<div class="pp-vehicle-ring"></div>` +
      `<div class="pp-vehicle-body"><div class="pp-vehicle-rot">${glyphFor(kind)}</div></div>` +
      `<div class="pp-vehicle-tag">${escapeHtml(label)}</div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -30],
  });
}

function applyHeading(
  marker: L.Marker,
  kind: VehicleKind,
  heading: number,
  state: VehicleState,
  instant: boolean
) {
  const el = marker.getElement()?.querySelector<HTMLElement>(".pp-vehicle-rot");
  if (!el) return;

  if (kind === "plane") {
    if (instant) {
      state.angle = heading;
      el.style.transition = "none";
      el.style.transform = `rotate(${heading}deg)`;
      void el.offsetWidth;
      el.style.transition = "";
    } else {
      const delta = ((heading - state.angle + 540) % 360) - 180;
      state.angle += delta;
      el.style.transform = `rotate(${state.angle}deg)`;
    }
    return;
  }

  const faceWest = Math.sin((heading * Math.PI) / 180) < -0.05;
  el.style.transform = faceWest ? "scaleX(-1)" : "scaleX(1)";
}

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export default function AnimatedVehicleMarker({
  path,
  fraction,
  exact,
  kind,
  label,
  popupHtml,
}: Props) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const stateRef = useRef<VehicleState | null>(null);
  const frameRef = useRef<number | null>(null);

  const pathKey = `${path.length}:${path[0]?.join(",")}:${path[path.length - 1]?.join(",")}`;

  // Create the marker once (only rebuilt if the vehicle type changes).
  useEffect(() => {
    const cum = cumulative(path);
    const info = pointAtFraction(path, cum, fraction);
    const start: LatLng = exact ?? info.pos;

    const marker = L.marker(start, {
      icon: buildIcon(kind, label),
      zIndexOffset: 10000,
      keyboard: false,
    }).addTo(map);

    marker.bindPopup(popupHtml);
    markerRef.current = marker;
    stateRef.current = { fraction, angle: 0, key: pathKey, pos: start };
    applyHeading(marker, kind, info.heading, stateRef.current, true);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      marker.remove();
      markerRef.current = null;
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, kind, label]);

  // Status changes only update the popup text. The marker is not rebuilt.
  useEffect(() => {
    markerRef.current?.setPopupContent(popupHtml);
  }, [popupHtml, kind, label]);

  // Glide to every new position.
  useEffect(() => {
    const marker = markerRef.current;
    const st = stateRef.current;
    if (!marker || !st) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const cum = cumulative(path);
    const total = cum[cum.length - 1] ?? 0;
    const toInfo = pointAtFraction(path, cum, fraction);
    const target: LatLng = exact ?? toInfo.pos;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (st.key !== pathKey || reduced || path.length < 2 || total <= 0) {
      st.key = pathKey;
      st.fraction = fraction;
      st.pos = target;
      marker.setLatLng(target);
      applyHeading(marker, kind, toInfo.heading, st, true);
      return;
    }

    const from = st.fraction;
    const to = fraction;
    if (from === to && st.pos[0] === target[0] && st.pos[1] === target[1]) return;

    const fromPoint = pointAtFraction(path, cum, from).pos;
    const offStart: LatLng = [st.pos[0] - fromPoint[0], st.pos[1] - fromPoint[1]];
    const offEnd: LatLng = [target[0] - toInfo.pos[0], target[1] - toInfo.pos[1]];
    const duration = Math.min(5000, 1500 + Math.abs(to - from) * 5000);
    const t0 = performance.now();

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = ease(p);
      const f = from + (to - from) * e;
      const info = pointAtFraction(path, cum, f);
      const next: LatLng = [
        info.pos[0] + offStart[0] + (offEnd[0] - offStart[0]) * e,
        info.pos[1] + offStart[1] + (offEnd[1] - offStart[1]) * e,
      ];

      marker.setLatLng(next);
      st.pos = next;
      st.fraction = f;
      if (from !== to) applyHeading(marker, kind, info.heading, st, false);

      if (p < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        frameRef.current = null;
        st.fraction = to;
        st.pos = target;
        marker.setLatLng(target);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey, fraction, exact?.[0], exact?.[1], kind]);

  return null;
}
