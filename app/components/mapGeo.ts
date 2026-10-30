export type LatLng = [number, number];

const EARTH_RADIUS = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function bearing(a: LatLng, b: LatLng): number {
  const p1 = toRad(a[0]);
  const p2 = toRad(b[0]);
  const dl = toRad(b[1] - a[1]);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function greatCircle(a: LatLng, b: LatLng, steps = 72): LatLng[] {
  const d = haversine(a, b) / EARTH_RADIUS;
  if (!Number.isFinite(d) || d < 1e-5) return [a, b];

  const p1 = toRad(a[0]);
  const l1 = toRad(a[1]);
  const p2 = toRad(b[0]);
  const l2 = toRad(b[1]);

  const out: LatLng[] = [];
  let prevLng = a[1];

  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    let lng = toDeg(Math.atan2(y, x));
    while (lng - prevLng > 180) lng -= 360;
    while (lng - prevLng < -180) lng += 360;
    prevLng = lng;
    out.push([lat, lng]);
  }

  return out;
}

export function dedupe(path: LatLng[]): LatLng[] {
  const out: LatLng[] = [];
  for (const p of path) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last[0] - p[0]) > 1e-7 || Math.abs(last[1] - p[1]) > 1e-7) {
      out.push(p);
    }
  }
  return out;
}

export function cumulative(path: LatLng[]): number[] {
  const cum: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1] + haversine(path[i - 1], path[i]));
  }
  return cum;
}

function segmentIndex(cum: number[], target: number): number {
  let i = 1;
  while (i < cum.length - 1 && cum[i] < target) i++;
  return i;
}

export function projectOnPath(path: LatLng[], point: LatLng): number {
  if (path.length < 2) return 0;
  const cum = cumulative(path);
  const total = cum[cum.length - 1];
  if (total <= 0) return 0;

  const k = Math.cos(toRad(point[0]));
  let best = Infinity;
  let bestAlong = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const ax = a[1] * k;
    const ay = a[0];
    const bx = b[1] * k;
    const by = b[0];
    const px = point[1] * k;
    const py = point[0];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + dx * t;
    const cy = ay + dy * t;
    const dist = (px - cx) ** 2 + (py - cy) ** 2;
    if (dist < best) {
      best = dist;
      bestAlong = cum[i] + (cum[i + 1] - cum[i]) * t;
    }
  }

  return bestAlong / total;
}

export function pointAtFraction(
  path: LatLng[],
  cum: number[],
  fraction: number
): { pos: LatLng; heading: number } {
  if (path.length === 0) return { pos: [0, 0], heading: 0 };
  const total = cum[cum.length - 1] ?? 0;
  if (path.length < 2 || total <= 0) return { pos: path[0], heading: 0 };

  const target = Math.max(0, Math.min(1, fraction)) * total;
  const i = segmentIndex(cum, target);
  const seg = cum[i] - cum[i - 1];
  const t = seg > 0 ? (target - cum[i - 1]) / seg : 0;
  const a = path[i - 1];
  const b = path[i];

  return {
    pos: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
    heading: bearing(a, b),
  };
}

export function splitPath(
  path: LatLng[],
  cum: number[],
  fraction: number
): { before: LatLng[]; after: LatLng[] } {
  if (path.length < 2) return { before: path, after: path };
  const total = cum[cum.length - 1] ?? 0;
  const target = Math.max(0, Math.min(1, fraction)) * total;
  const i = segmentIndex(cum, target);
  const { pos } = pointAtFraction(path, cum, fraction);
  return {
    before: [...path.slice(0, i), pos],
    after: [pos, ...path.slice(i)],
  };
}
