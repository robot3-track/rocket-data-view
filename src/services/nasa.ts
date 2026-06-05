// NASA API service layer — all external HTTP lives here.
// Key is read from env (VITE_NASA_API_KEY). Falls back to "DEMO_KEY" for
// local dev; UI surfaces a warning when the real key is missing.

export const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY as string | undefined;
export const HAS_NASA_KEY = Boolean(NASA_API_KEY && NASA_API_KEY !== "DEMO_KEY");
const KEY = NASA_API_KEY || "DEMO_KEY";

export type DatasetId = "neo" | "mars-weather" | "apod" | "donki-flr";

export interface DatasetOption {
  id: DatasetId;
  label: string;
  description: string;
}

export const DATASETS: DatasetOption[] = [
  { id: "neo", label: "NEO Asteroids", description: "Near-Earth Objects from NeoWs feed" },
  { id: "mars-weather", label: "Mars Weather (InSight)", description: "Latest sols from InSight lander" },
  { id: "apod", label: "Astronomy Picture of the Day", description: "Recent APOD entries" },
  { id: "donki-flr", label: "Solar Flares (DONKI)", description: "Recent solar flare events" },
];

export interface DataPoint {
  id: string;
  label: string;
  value: number;
  category: string;
  timestamp: string;
  anomaly: boolean;
}

export interface AnalysisResult {
  dataset: DatasetId;
  fetchedAt: string;
  points: DataPoint[];
  series: { date: string; value: number }[];
  kpis: {
    activeAnomalies: number;
    totalDataPoints: number;
    systemHealth: number; // 0–100
    solarActivity: string;
  };
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function getJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA API ${res.status}: ${res.statusText}`);
  return res.json();
}

async function fetchNEO(): Promise<AnalysisResult> {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 86400000);
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${ymd(start)}&end_date=${ymd(end)}&api_key=${KEY}`;
  const json = await getJSON(url);
  const byDate = json.near_earth_objects as Record<string, any[]>;
  const points: DataPoint[] = [];
  const series: { date: string; value: number }[] = [];
  for (const date of Object.keys(byDate).sort()) {
    const list = byDate[date];
    series.push({ date, value: list.length });
    for (const o of list) {
      const dia = o.estimated_diameter?.meters?.estimated_diameter_max ?? 0;
      points.push({
        id: o.id,
        label: o.name,
        value: Math.round(dia),
        category: o.is_potentially_hazardous_asteroid ? "Hazardous" : "Standard",
        timestamp: date,
        anomaly: o.is_potentially_hazardous_asteroid,
      });
    }
  }
  const anomalies = points.filter((p) => p.anomaly).length;
  return {
    dataset: "neo",
    fetchedAt: new Date().toISOString(),
    points,
    series,
    kpis: {
      activeAnomalies: anomalies,
      totalDataPoints: points.length,
      systemHealth: Math.max(40, 100 - anomalies * 2),
      solarActivity: "Nominal",
    },
  };
}

async function fetchAPOD(): Promise<AnalysisResult> {
  const url = `https://api.nasa.gov/planetary/apod?count=14&api_key=${KEY}`;
  const arr = (await getJSON(url)) as any[];
  const sorted = [...arr].sort((a, b) => a.date.localeCompare(b.date));
  const points: DataPoint[] = sorted.map((a, i) => ({
    id: `${a.date}-${i}`,
    label: a.title,
    value: (a.explanation?.length ?? 0),
    category: a.media_type,
    timestamp: a.date,
    anomaly: a.media_type !== "image",
  }));
  const series = sorted.map((a) => ({ date: a.date, value: (a.explanation?.length ?? 0) / 100 }));
  return {
    dataset: "apod",
    fetchedAt: new Date().toISOString(),
    points,
    series,
    kpis: {
      activeAnomalies: points.filter((p) => p.anomaly).length,
      totalDataPoints: points.length,
      systemHealth: 98,
      solarActivity: "Quiet",
    },
  };
}

async function fetchDONKI(): Promise<AnalysisResult> {
  const end = new Date();
  const start = new Date(end.getTime() - 29 * 86400000);
  const url = `https://api.nasa.gov/DONKI/FLR?startDate=${ymd(start)}&endDate=${ymd(end)}&api_key=${KEY}`;
  const arr = (await getJSON(url)) as any[];
  const points: DataPoint[] = arr.map((f, i) => ({
    id: f.flrID ?? String(i),
    label: f.classType ?? "Flare",
    value: classToValue(f.classType),
    category: (f.classType ?? "?").charAt(0),
    timestamp: (f.beginTime ?? "").slice(0, 10),
    anomaly: /^[MX]/.test(f.classType ?? ""),
  }));
  const grouped: Record<string, number> = {};
  for (const p of points) grouped[p.timestamp] = (grouped[p.timestamp] || 0) + 1;
  const series = Object.keys(grouped).sort().map((d) => ({ date: d, value: grouped[d] }));
  const xCount = points.filter((p) => p.category === "X").length;
  const mCount = points.filter((p) => p.category === "M").length;
  return {
    dataset: "donki-flr",
    fetchedAt: new Date().toISOString(),
    points,
    series,
    kpis: {
      activeAnomalies: xCount + mCount,
      totalDataPoints: points.length,
      systemHealth: Math.max(30, 100 - xCount * 10 - mCount * 3),
      solarActivity: xCount > 0 ? "Severe (X-class)" : mCount > 2 ? "Active (M-class)" : "Moderate",
    },
  };
}

function classToValue(c?: string): number {
  if (!c) return 0;
  const cls = c.charAt(0);
  const num = parseFloat(c.slice(1)) || 1;
  const base: Record<string, number> = { A: 0.1, B: 1, C: 10, M: 100, X: 1000 };
  return Math.round((base[cls] ?? 0) * num);
}

async function fetchMars(): Promise<AnalysisResult> {
  // InSight weather feed. If the feed is empty (the mission is retired and
  // NASA frequently returns no sols), we surface that as "no data" rather
  // than fabricating values.
  const url = `https://api.nasa.gov/insight_weather/?api_key=${KEY}&feedtype=json&ver=1.0`;
  const json = await getJSON(url);
  const sols: string[] = json.sol_keys ?? [];
  if (sols.length === 0) {
    throw new Error(
      "NASA InSight weather feed returned no sols. The mission is retired and the public endpoint is intermittently empty.",
    );
  }
  const points: DataPoint[] = [];
  const series: { date: string; value: number }[] = [];
  for (const sol of sols) {
    const s = json[sol];
    const t = s?.AT?.av;
    const p = s?.PRE?.av;
    const w = s?.HWS?.av;
    const date = s?.First_UTC?.slice(0, 10) ?? sol;
    if (typeof t === "number") {
      series.push({ date, value: t });
      points.push({
        id: `sol-${sol}-AT`,
        label: `Sol ${sol} Avg Temp`,
        value: Math.round(t * 10) / 10,
        category: "Temperature (°C)",
        timestamp: date,
        anomaly: t < -90,
      });
    }
    if (typeof p === "number")
      points.push({
        id: `sol-${sol}-P`,
        label: `Sol ${sol} Pressure`,
        value: Math.round(p),
        category: "Pressure (Pa)",
        timestamp: date,
        anomaly: false,
      });
    if (typeof w === "number")
      points.push({
        id: `sol-${sol}-W`,
        label: `Sol ${sol} Wind`,
        value: Math.round(w * 10) / 10,
        category: "Wind (m/s)",
        timestamp: date,
        anomaly: w > 15,
      });
  }
  return {
    dataset: "mars-weather",
    fetchedAt: new Date().toISOString(),
    points,
    series,
    kpis: {
      activeAnomalies: points.filter((p) => p.anomaly).length,
      totalDataPoints: points.length,
      systemHealth: 88,
      solarActivity: "N/A (Mars)",
    },
  };
}

export async function fetchDataset(id: DatasetId): Promise<AnalysisResult> {
  switch (id) {
    case "neo":
      return fetchNEO();
    case "mars-weather":
      return fetchMars();
    case "apod":
      return fetchAPOD();
    case "donki-flr":
      return fetchDONKI();
  }
}

export function toCSV(points: DataPoint[]): string {
  const header = ["id", "label", "value", "category", "timestamp", "anomaly"];
  const rows = points.map((p) =>
    header
      .map((k) => {
        const v = String((p as any)[k] ?? "");
        return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
      })
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
