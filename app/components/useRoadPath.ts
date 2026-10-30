"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "./mapGeo";

type RoadState = {
  path: LatLng[];
  source: "idle" | "loading" | "road" | "fallback";
};

const cache = new Map<string, LatLng[]>();

export function useRoadPath(
  start: LatLng | null,
  end: LatLng | null,
  enabled: boolean
): RoadState {
  const key =
    enabled && start && end
      ? [start[0], start[1], end[0], end[1]].map((n) => n.toFixed(5)).join(",")
      : "";

  const [state, setState] = useState<{ key: string; path: LatLng[]; source: "road" | "fallback" } | null>(null);

  useEffect(() => {
    if (!key || cache.has(key)) return;

    const [sLat, sLng, eLat, eLng] = key.split(",").map(Number);
    const controller = new AbortController();

    (async () => {
      try {
        const url =
          "https://router.project-osrm.org/route/v1/driving/" +
          `${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson&steps=false`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Road routing unavailable");
        const data = await res.json();
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) throw new Error("No road route");

        const path: LatLng[] = coords
          .filter((p: unknown) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
          .map((p: number[]) => [p[1], p[0]] as LatLng);

        if (path.length < 2) throw new Error("Road route too short");
        cache.set(key, path);
        setState({ key, path, source: "road" });
      } catch {
        if (controller.signal.aborted) return;
        setState({
          key,
          path: [
            [sLat, sLng],
            [eLat, eLng],
          ],
          source: "fallback",
        });
      }
    })();

    return () => controller.abort();
  }, [key]);

  if (!key) return { path: [], source: "idle" };
  const cached = cache.get(key);
  if (cached) return { path: cached, source: "road" };
  if (state && state.key === key) return { path: state.path, source: state.source };
  return { path: [], source: "loading" };
}
