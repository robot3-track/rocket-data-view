import * as React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  Database,
  HeartPulse,
  Sun,
  Loader2,
  BookOpen,
  ShieldAlert,
  Settings,
  ChevronRight,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/workspace/AppSidebar";
import { KpiCard } from "@/components/workspace/KpiCard";
import { DataChart } from "@/components/workspace/DataChart";
import { IngestionPanel } from "@/components/workspace/IngestionPanel";
import { DataTable } from "@/components/workspace/DataTable";
import { CorrelatedView } from "@/components/workspace/CorrelatedView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  DATASETS,
  HAS_NASA_KEY,
  fetchDataset,
  type AnalysisResult,
  type DatasetId,
  type DataPoint,
} from "@/services/nasa";

type Tab = "overview" | "ingestion" | "anomalies" | "settings" | "documentation" | "correlation";

export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dataset, setDataset] = useState<DatasetId>("neo");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const datasetLabel = useMemo(() => {
    const targetId = result?.dataset ?? dataset;
    return DATASETS.find((d) => d.id === targetId)?.label ?? "Dataset";
  }, [result?.dataset, dataset]);

  const anomalies = useMemo(() => {
    return result?.points.filter((p) => p.anomaly) ?? [];
  }, [result?.points]);

  const runAnalysis = useCallback(async (id: DatasetId, abortSignal?: { active: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDataset(id);
      if (abortSignal && !abortSignal.active) return;
      setResult(data);
    } catch (err) {
      if (abortSignal && !abortSignal.active) return;
      setResult(null);
      setError(
        err instanceof Error ? err.message : "Unable to establish baseline telemetry from source feeds.",
      );
    } finally {
      if (!abortSignal || abortSignal.active) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const context = { active: true };
    runAnalysis(dataset, context);
    return () => {
      context.active = false;
    };
  }, [dataset, runAnalysis]);

  return (
    <SidebarProvider>
      <Toaster />
      <div className="flex min-h-screen w-full bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white">
        
        {/* Brand & Identity Frame Container */}
        <div className="relative flex">
          <AppSidebar activeTab={tab} onSelect={setTab} />
          <div className="absolute top-5 left-6 z-20 pointer-events-none flex items-center gap-3">
            <img
              src="/Favicon.png"
              alt="NASA Logo"
              className="h-6 w-6 object-contain filter grayscale contrast-200 opacity-90 transition-all"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        <SidebarInset className="flex flex-col bg-transparent min-w-0 overflow-x-hidden">
          {/* Minimalist Editorial Header */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-zinc-200/60 bg-[#fafafa]/80 px-6 md:px-10 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-zinc-400 hover:text-zinc-900 transition-colors shrink-0" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                  <span>Workspace</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600 font-semibold lowercase">
                    {tab === "ingestion" ? "data ingestion" : `${tab}`}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400">
                  {loading ? (
                    <span className="flex items-center gap-2 text-zinc-500">
                      <Loader2 className="h-3 w-3 animate-spin text-zinc-400" /> establishing stream...
                    </span>
                  ) : result ? (
                    `sync_completed // ${new Date(result.fetchedAt).toLocaleTimeString()}`
                  ) : (
                    "status // standby"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium font-mono border ${
                HAS_NASA_KEY 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/50" 
                  : "bg-amber-50/70 text-amber-800 border-amber-200/40"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${HAS_NASA_KEY ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                {HAS_NASA_KEY ? "LIVE_FEED" : "SANDBOX_CACHE"}
              </span>
            </div>
          </header>

          {/* Main Layout Canvas Flow */}
          <main className="flex-1 space-y-8 p-6 md:p-10 w-full max-w-[1500px] mx-auto min-w-0 overflow-x-hidden">
            {!HAS_NASA_KEY && <KeyMissingAlert />}
            {error && <TelemetryFailureAlert message={error} />}

            {tab === "overview" && (
              <OverviewTab
                result={result}
                datasetLabel={datasetLabel}
                anomalies={anomalies}
                loading={loading}
                activeDataset={dataset}
                onDatasetChange={setDataset}
              />
            )}

            {tab === "ingestion" && (
              <IngestionTab
                dataset={dataset}
                result={result}
                datasetLabel={datasetLabel}
                loading={loading}
                onDatasetChange={setDataset}
                onForceReload={() => runAnalysis(dataset)}
              />
            )}

            {tab === "anomalies" && (
              <AnomaliesTab result={result} datasetLabel={datasetLabel} anomalies={anomalies} />
            )}

            {tab === "settings" && <SettingsTab />}

            {tab === "documentation" && <DocumentationTab />}

            {tab === "correlation" && <CorrelatedView />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/* ==========================================================================
   MODULAR WORKSPACE VIEWS
   ========================================================================== */

interface MetricsPanelProps {
  result: AnalysisResult | null;
  datasetLabel: string;
}

interface IngestionTabProps extends MetricsPanelProps {
  dataset: DatasetId;
  loading: boolean;
  onDatasetChange: (v: DatasetId) => void;
  onForceReload: () => void;
}

function GlobalMetricsPanel({ result, datasetLabel }: MetricsPanelProps) {
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Active Outliers"
        value={result?.kpis.activeAnomalies ?? "0"}
        hint="Flags requiring priority verification"
        icon={AlertTriangle}
        tone="destructive"
        className="bg-white border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-6 rounded-2xl text-zinc-900"
      />
      <KpiCard
        label="Observed Footprint"
        value={result ? result.kpis.totalDataPoints.toLocaleString() : "—"}
        hint={datasetLabel}
        icon={Database}
        tone="primary"
        className="bg-white border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-6 rounded-2xl text-zinc-900"
      />
      <KpiCard
        label="Telemetry Stability Index"
        value={result ? `${result.kpis.systemHealth}%` : "—"}
        hint="Calculated moving window health rating"
        icon={HeartPulse}
        tone="success"
        className="bg-white border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-6 rounded-2xl text-zinc-900"
      />
      <KpiCard
        label="Solar Magnetics Status"
        value={result?.kpis.solarActivity ?? "Nominal"}
        hint="Heliophysics baseline index"
        icon={Sun}
        tone="warning"
        className="bg-white border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 p-6 rounded-2xl text-zinc-900"
      />
    </section>
  );
}

function OverviewTab({
  result,
  datasetLabel,
  anomalies,
  loading,
  onDatasetChange,
  activeDataset,
}: MetricsPanelProps & {
  anomalies: DataPoint[];
  loading: boolean;
  activeDataset: any;
  onDatasetChange: (val: any) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Dynamic Segment Control Sub-Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200/60 pb-5">
        <div className="flex gap-1 bg-zinc-200/50 p-1 rounded-xl max-w-full overflow-x-auto whitespace-nowrap no-scrollbar">
          {[
            { id: "neo", label: "NEO Asteroids" },
            { id: "mars-weather", label: "Mars Atmosphere" },
            { id: "apod", label: "APOD Registry" },
            { id: "donki-flr", label: "Solar Events" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => onDatasetChange(d.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeDataset === d.id
                  ? "bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-wider text-zinc-400 uppercase bg-zinc-100/70 border border-zinc-200/40 px-3 py-1 rounded-md w-fit">
          <Terminal className="h-3 w-3 text-zinc-400" />
           feed //{" "}
          <span className="font-bold text-zinc-700">
            {activeDataset === "neo" && "NEO_ARRAY"}
            {activeDataset === "mars-weather" && "INSIGHT_SOL_ARRAY"}
            {activeDataset === "apod" && "APOD_METADATA"}
            {activeDataset === "donki-flr" && "DONKI_FLR_ARRAY"}
          </span>
        </span>
      </div>

      <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />

      {/* Grid Canvas for Chart and Flagged Items */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="border-zinc-200/80 bg-white rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] lg:col-span-2 overflow-hidden">
          <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold tracking-tight text-zinc-900">
                Data Stream Visualizer
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Continuous baseline values across chronological reporting points.
              </CardDescription>
            </div>
            <Activity className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <DataChart data={result?.series ?? []} />
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
          <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold tracking-tight text-zinc-900">
                Flagged Outliers
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Observations that crossed critical telemetry envelopes.
              </CardDescription>
            </div>
            <ShieldAlert className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-2">
            {anomalies.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-[#fbfbfb] px-4 py-3 text-xs transition-colors hover:bg-zinc-50"
              >
                <span className="font-medium text-zinc-700 truncate pr-3">{a.label}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase font-semibold text-red-700 bg-red-50 border border-red-100 rounded-md px-2 py-0.5">
                  {a.category}
                </span>
              </div>
            ))}
            {anomalies.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-1">
                <p className="text-xs font-medium text-zinc-500">Perfect nominal status</p>
                <p className="text-[11px] text-zinc-400">No telemetry outliers detected inside this frame.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Main Stream Registry */}
      <section className="border border-zinc-200/80 rounded-2xl bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden p-2">
        <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
      </section>
    </div>
  );
}

function IngestionTab({
  dataset,
  result,
  datasetLabel,
  loading,
  onDatasetChange,
  onForceReload,
}: IngestionTabProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1">
          <IngestionPanel
            dataset={dataset}
            onDatasetChange={onDatasetChange}
            onAnalyze={onForceReload}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-2">
          <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />
        </div>
      </div>
      <section className="border border-zinc-200/80 rounded-2xl bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden p-2">
        <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
      </section>
    </div>
  );
}

function AnomaliesTab({
  result,
  datasetLabel,
  anomalies,
}: MetricsPanelProps & { anomalies: any[] }) {
  const criticalCount = anomalies.filter(
    (p: any) => p.isAnomaly && Math.abs(p.value || 0) > 80,
  ).length;
  const warningCount = anomalies.length - criticalCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Isolated Vectors</span>
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{anomalies.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Critical Thresholds</span>
            <span className="text-2xl font-bold tracking-tight text-red-600">{criticalCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Minor Deviations</span>
            <span className="text-2xl font-bold tracking-tight text-amber-600">{warningCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 text-amber-600 border border-amber-100/50">
            <Activity className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
          <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" /> Active Registry Incident Logs
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-mono bg-zinc-100 text-zinc-600 rounded-md border border-zinc-200/40">
            {datasetLabel}
          </span>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden p-2">
          <DataTable points={anomalies} datasetLabel="Anomaly Isolated Thresholds" />
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <Card className="border-zinc-200/80 bg-white rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
      <CardHeader className="p-6 border-b border-zinc-100">
        <CardTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
          <Settings className="h-4 w-4 text-zinc-400" /> API Gateway Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6 text-sm text-zinc-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-medium block text-zinc-800">
              NASA Open Data Network Pipeline
            </span>
            <span className="text-xs text-zinc-400">Secure asymmetric stream decryption parameters.</span>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-mono border w-fit ${
            HAS_NASA_KEY 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-zinc-100 text-zinc-600 border-zinc-200"
          }`}>
            {HAS_NASA_KEY ? "verified_operational" : "unconfigured_snapshot"}
          </span>
        </div>
        
        <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl space-y-2">
          <p className="text-zinc-600 leading-relaxed text-xs">
            The data sync manager maps node queries to open relays through the target token parameter inside your global system environment layout file:
          </p>
          <code className="inline-block font-mono text-[11px] rounded bg-white border border-zinc-200 px-2 py-1 text-zinc-800">
            VITE_NASA_API_KEY=[secured_string]
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentationTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-zinc-800" /> System Metrics Manual & Formulas
        </h2>
        <p className="text-xs text-zinc-400 max-w-2xl">
          An operational lookup matrix explaining how real-time ingestion calculations process telemetry records.
        </p>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="inline-flex items-center bg-zinc-200/60 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="kpis"
            className="text-xs font-medium px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm cursor-pointer transition-all"
          >
            Core Functions
          </TabsTrigger>
          <TabsTrigger
            value="datasets"
            className="text-xs font-medium px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm cursor-pointer transition-all"
          >
            Dataset Registries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <Card className="border-zinc-200/80 bg-white rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
            <CardContent className="p-2">
              <Table>
                <TableHeader className="bg-zinc-50/70">
                  <TableRow className="border-b border-zinc-100">
                    <TableHead className="w-[200px] text-xs font-semibold text-zinc-600">Metric Node</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-600">Calculation Logic</TableHead>
                    <TableHead className="w-[120px] text-xs font-semibold text-zinc-600">Classification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <TableCell className="font-medium flex items-center gap-2 text-zinc-800 text-xs">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" /> Active Envelopes
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400 leading-relaxed">
                      Monitors ongoing threat definitions. Implements threshold alerts when raw planetary trajectories fall within orbital baseline hazard coefficients.
                    </TableCell>
                    <TableCell>
                      <span className="inline-block text-[10px] font-mono font-semibold bg-red-50 text-red-700 border border-red-100 rounded px-2 py-0.5">PRIORITY_1</span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <TableCell className="font-medium flex items-center gap-2 text-zinc-800 text-xs">
                      <HeartPulse className="h-3.5 w-3.5 text-emerald-500" /> Core System Index
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400 leading-relaxed">
                      Evaluates total stream integrity. Drops standard percentage tracking arrays dynamically based on anomaly frequency occurrences per rolling 24-hour cycle.
                    </TableCell>
                    <TableCell>
                      <span className="inline-block text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 rounded px-2 py-0.5">ROLLING_AVG</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-zinc-200/80 bg-white rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                <Database className="h-3.5 w-3.5 text-zinc-400" /> Near-Earth Objects (NeoWs)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-zinc-500 space-y-3">
              <p>Tracks local asteroid trajectories intersecting earth-moon barycenter bounds.</p>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-300 mt-0.5">—</span> Mapped metric diameters based on historical absolute luminosity.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-300 mt-0.5">—</span> Collision window indices calculated via automated approach tracks.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 bg-white rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                <Sun className="h-3.5 w-3.5 text-zinc-400" /> Space Weather Architecture (DONKI)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-zinc-500 space-y-3">
              <p>Aggregates coronal mass ejections and solar particle anomalies across interplanetary monitoring relays.</p>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-300 mt-0.5">—</span> Magnetic flux indexes simplified into actionable warning matrices.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-300 mt-0.5">—</span> Shockwave duration timelines paired with telemetry stability drops.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KeyMissingAlert() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-amber-50/50 border border-amber-200/60 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-amber-900 tracking-tight">Using system cache sandbox</p>
          <p className="text-[11px] text-amber-700/90 leading-relaxed">
            The workspace is showing localized structural arrays. Provide an access environment secret token key to stream data pipelines live.
          </p>
        </div>
      </div>
    </div>
  );
}

function TelemetryFailureAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-5 bg-red-50/60 border border-red-200/60 rounded-xl">
      <RefreshCw className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-red-900 tracking-tight">Stream connection failure</p>
        <p className="text-[11px] text-red-700/90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
