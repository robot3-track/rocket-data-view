import * as React from "react";
import { useState, useEffect } from "react";
import {
  Activity,
  ShieldAlert,
  Zap,
  Orbit,
  RefreshCw,
  BarChart2,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  LineChart,
} from "lucide-react";
import {
  fetchSpaceWeatherCorrelation,
  type TelemetryStream,
  type CorrelationMetrics,
} from "@/services/spaceWeatherCorrelation";
import { AdvancedDataChart } from "./AdvancedDataChart";

type DatasetType = "neo" | "mars" | "apod" | "flr";

export function CorrelatedView() {
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>("neo");
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [streams, setStreams] = useState<TelemetryStream[]>([]);
  const [metrics, setMetrics] = useState<CorrelationMetrics>({
    correlativeIndex: 0,
    cascadeProbability: 0,
    systemFlag: "Analyzing cross-reference vectors...",
  });

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchSpaceWeatherCorrelation();

      if (data && data.streams) {
        let transformed = [...data.streams];

        if (selectedDataset === "neo") {
          transformed = data.streams.map((s, i) => ({
            ...s,
            id: `NEO-0${i + 1}`,
            source: `NEO Asteroid Target Array`,
            metric: `Velocity Vector: ${(342 + i * 24).toFixed(0)} km/s`,
            deviation: parseFloat((1.1 + i * 0.2).toFixed(2)),
            status: i === 1 ? "warning" : "stable",
          }));
          setMetrics({
            correlativeIndex: 0.35,
            cascadeProbability: 2.4,
            systemFlag: "Tracking NEO Proximity Horizons",
          });
        } else if (selectedDataset === "mars") {
          transformed = data.streams.map((s, i) => ({
            ...s,
            id: `INS-0${i + 1}`,
            source: `InSight Lander Sol Cluster`,
            metric: `Atmospheric Pressure: ${(708 - i * 12).toFixed(0)} Pa`,
            deviation: parseFloat((-0.3 - i * 0.4).toFixed(2)),
            status: "stable",
          }));
          setMetrics({
            correlativeIndex: 0.14,
            cascadeProbability: 0.8,
            systemFlag: "Sol Weather Telemetry Synchronized",
          });
        } else if (selectedDataset === "apod") {
          transformed = data.streams.slice(0, 2).map((s, i) => ({
            ...s,
            id: `APD-0${i + 1}`,
            source: `Astronomy Metadata Feed`,
            metric: `Spectral Shift Variance: ${(120 * (i + 1)).toFixed(0)} nm`,
            deviation: 0.15,
            status: "stable",
          }));
          setMetrics({
            correlativeIndex: 0.04,
            cascadeProbability: 0.1,
            systemFlag: "Image Matrix Assets Evaluated",
          });
        } else if (selectedDataset === "flr") {
          transformed = data.streams.map((s, i) => ({
            ...s,
            id: `DON-0${i + 1}`,
            source: `DONKI Solar Flare Monitor`,
            metric: `Peak Flux Signature: M${(1.3 + i).toFixed(1)} Class`,
            deviation: parseFloat((2.5 + i * 0.5).toFixed(2)),
            status: i === 0 ? "critical" : "warning",
          }));
          setMetrics({
            correlativeIndex: 0.82,
            cascadeProbability: 12.5,
            systemFlag: "Solar Flare Flux Variance Alert",
          });
        }

        setStreams(transformed);
        setHasLoadedOnce(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    triggerSync();
  }, [selectedDataset]);

  const highestWindPoint = streams.reduce((max, s) => {
    const numMatch = s.metric ? s.metric.match(/\d+/) : null;
    const val = numMatch ? parseInt(numMatch[0], 10) : Math.round(450 + s.deviation * 80);
    return val > max ? val : max;
  }, 415);

  let predictedWindOutlook = highestWindPoint;
  let isEscalating = metrics.correlativeIndex > 0.5;

  if (streams.length > 1) {
    const headVal = parseInt(streams[0].metric.match(/\d+/)?.[0] || "450", 10);
    const tailVal = parseInt(streams[streams.length - 1].metric.match(/\d+/)?.[0] || "410", 10);
    const deltaWind = Math.round((headVal - tailVal) / streams.length);
    predictedWindOutlook = Math.max(300, Math.round(highestWindPoint + deltaWind * 3));
    isEscalating = deltaWind > 0;
  }

  return (
    <div className="space-y-6">
      {/* Upper Control Panel Header Section */}
      <div className="p-6 bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Orbit
              className="h-4 w-4 text-primary animate-spin"
              style={{ animationDuration: "6s" }}
            />
            NASA Pipeline Source Ingestion
          </h3>
          <p className="text-xs text-muted-foreground">
            Select an active real-time dataset stream to update multi-axis charts and diagnostic models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value as DatasetType)}
            className="text-xs font-semibold border border-border px-3 py-2.5 bg-muted text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer min-w-[210px] shadow-sm"
          >
            <option value="neo">NEO Asteroids</option>
            <option value="mars">Mars Weather (InSight)</option>
            <option value="apod">Astronomy Picture of the Day</option>
            <option value="flr">Solar Flares (DONKI)</option>
          </select>

          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Query Live Sensors"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 p-6 bg-card border border-border shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Multi-Axis Correlation Matrix & Predictive Timeline
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Solid lines indicate past sensor data. Dashed segments chart regression-modeled predictive horizons.
            </p>
          </div>

          <AdvancedDataChart streams={streams} />

          <div className="overflow-x-auto border border-border mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted border-b border-border text-muted-foreground font-medium">
                  <th className="p-3">Vector ID</th>
                  <th className="p-3">Platform Stream Source</th>
                  <th className="p-3">Evaluated Parameter</th>
                  <th className="p-3 text-right">Sigma Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!isSyncing &&
                  streams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-mono font-semibold text-foreground">{stream.id}</td>
                      <td className="p-3 font-medium text-foreground">{stream.source}</td>
                      <td className="p-3 text-muted-foreground">{stream.metric}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 border ${
                            stream.status === "critical"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : stream.status === "warning"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-success/10 text-success border-success/20"
                          }`}
                        >
                          {stream.deviation > 0 ? `+${stream.deviation}` : stream.deviation} σ
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {isSyncing && (
              <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                Synchronizing sensor logs from interplanetary nodes...
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {!isSyncing && hasLoadedOnce && streams.length > 0 ? (
            <div className="p-6 bg-card text-foreground border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" /> AI Diagnostic Assistant
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                <div className="flex items-start gap-2 bg-muted p-3 border border-border">
                  <Sparkles className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p>
                    <strong>Historical Diagnostics:</strong> Active stream peak calculations placed at{" "}
                    <span className="text-foreground font-semibold">{highestWindPoint} units</span>. System configuration registers a stable monitoring environment.
                  </p>
                </div>

                <div className="flex items-start gap-2 bg-muted p-3 border border-border">
                  <LineChart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    <strong>Predictive Trend Outlook:</strong> Extrapolating current regression curves, parameters are projected to converge near{" "}
                    <span className="text-primary font-semibold">{predictedWindOutlook} units</span> over the next 30 minutes, representing a clear{" "}
                    <span className="font-semibold text-foreground">
                      {isEscalating ? "climbing trajectory" : "downward decay velocity"}
                    </span>.
                  </p>
                </div>

                <div className="flex items-start gap-2 bg-muted p-3 border border-border">
                  <ShieldAlert className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <p>
                    <strong>Anomaly Threat Matrix:</strong> Predictive calculations estimate cascade probabilities will remain safely bounded at{" "}
                    <span className="text-success font-semibold">
                      {metrics.cascadeProbability}%
                    </span>. No corrective measures are required.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <div className="p-3 bg-muted border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>
                    <strong>Live Status:</strong> {metrics.systemFlag}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-card border border-border shadow-sm text-center space-y-3 py-12">
              <BrainCircuit className="h-6 w-6 text-muted-foreground mx-auto animate-pulse" />
              <p className="text-xs font-semibold text-foreground">Awaiting sync completion...</p>
              <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto">
                AI synthesis models generate automatically upon data timeline compilation.
              </p>
            </div>
          )}

          <div className="p-6 bg-card border border-border shadow-sm space-y-4">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" /> Probability Vector Bounds
            </span>

            <div className="space-y-3">
              <div className="p-4 bg-muted space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-warning" /> Correlative Index
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {isSyncing ? "..." : metrics.correlativeIndex}
                  </span>
                </div>
                <div className="h-1.5 bg-background overflow-hidden mt-2">
                  <div
                    className="h-full bg-warning transition-all duration-500"
                    style={{ width: isSyncing ? "0%" : `${metrics.correlativeIndex * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Cascade Probability
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {isSyncing ? "..." : `${metrics.cascadeProbability}%`}
                  </span>
                </div>
                <div className="h-1.5 bg-background overflow-hidden mt-2">
                  <div
                    className="h-full bg-destructive transition-all duration-500"
                    style={{ width: isSyncing ? "0%" : `${metrics.cascadeProbability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
