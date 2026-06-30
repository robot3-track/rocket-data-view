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
  Sparkles,
  GraduationCap
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
  // Default to 'neo' and dropped 'apod' entirely
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
        err instanceof Error ? err.message : "Whoops! Couldn't pull the latest telemetry from the NASA API.",
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
      <div className="flex min-h-screen w-full bg-[#fcfcfc] text-zinc-950 font-sans antialiased selection:bg-indigo-600 selection:text-white">
        
        {/* Brand/Identity Frame Container */}
        <div className="relative flex">
          <AppSidebar activeTab={tab} onSelect={setTab} />
          <div className="absolute top-5 left-6 z-20 pointer-events-none flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-indigo-600 drop-shadow-sm" />
          </div>
        </div>

        <SidebarInset className="flex flex-col bg-transparent min-w-0 overflow-x-hidden">
          {/* Student Sandbox Header */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-zinc-200/50 bg-[#fcfcfc]/80 px-6 md:px-10 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-zinc-400 hover:text-zinc-900 transition-colors shrink-0" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                  <span>My Capstone Project</span>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-indigo-600 lowercase bg-indigo-50/60 px-1.5 py-0.5 rounded-md font-mono">
                    {tab === "ingestion" ? "data lab" : `${tab}`}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-500">
                  {loading ? (
                    <span className="flex items-center gap-2 text-indigo-500">
                      <Loader2 className="h-3 w-3 animate-spin" /> querying telemetry streams...
                    </span>
                  ) : result ? (
                    `last_successful_fetch // ${new Date(result.fetchedAt).toLocaleTimeString()}`
                  ) : (
                    "status // local mock engine active"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-medium font-mono border ${
                HAS_NASA_KEY 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/50" 
                  : "bg-indigo-50 text-indigo-800 border-indigo-100"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${HAS_NASA_KEY ? "bg-emerald-500 animate-pulse" : "bg-indigo-400"}`} />
                {HAS_NASA_KEY ? "CONNECTED_LIVE_API" : "DEVELOPMENT_MOCK_MODE"}
              </span>
            </div>
          </header>

          {/* Main Content Layout Canvas */}
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
        label="Tracked Anomalies"
        value={result?.kpis.activeAnomalies ?? "0"}
        hint="Data points hitting my custom threshold criteria"
        icon={AlertTriangle}
        tone="destructive"
        className="bg-white border border-zinc-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 rounded-2xl text-zinc-900"
      />
      <KpiCard
        label="Parsed Rows"
        value={result ? result.kpis.totalDataPoints.toLocaleString() : "—"}
        hint={`Source: ${datasetLabel}`}
        icon={Database}
        tone="primary"
        className="bg-white border border-zinc-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 rounded-2xl text-zinc-900"
      />
      <KpiCard
        label="Calculated Stream Health"
        value={result ? `${result.kpis.systemHealth}%` : "—"}
        hint="Moving average validation checklist rate"
        icon={HeartPulse}
        tone="success"
        className="bg-white border border-zinc-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 rounded-2xl text-zinc-900"
      />
      <KpiCard
        label="Solar Magnetics Index"
        value={result?.kpis.solarActivity ?? "Nominal"}
        hint="Global baseline factor for solar winds"
        icon={Sun}
        tone="warning"
        className="bg-white border border-zinc-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 rounded-2xl text-zinc-900"
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
      {/* Adjusted Segment Control: APOD Filter Removed */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200/60 pb-5">
        <div className="flex gap-1 bg-zinc-200/60 p-1 rounded-xl max-w-full overflow-x-auto whitespace-nowrap">
          {[
            { id: "neo", label: "☄️ Near-Earth Asteroids" },
            { id: "mars-weather", label: "🪐 Mars Weather (InSight)" },
            { id: "donki-flr", label: "☀️ Solar Flares" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => onDatasetChange(d.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeDataset === d.id
                  ? "bg-white text-indigo-600 shadow-sm border border-zinc-200/30 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-wider text-zinc-400 uppercase bg-zinc-100/70 border border-zinc-200/40 px-3 py-1 rounded-md w-fit">
          <Terminal className="h-3 w-3 text-indigo-500" />
           active_module //{" "}
          <span className="font-bold text-zinc-700">
            {activeDataset === "neo" && "NEO_PARSER"}
            {activeDataset === "mars-weather" && "MARS_SOL_DECODING"}
            {activeDataset === "donki-flr" && "SOLAR_FLARE_MATRICES"}
          </span>
        </span>
      </div>

      {/* Intro Student Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50/50 border border-indigo-100 rounded-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-1 relative z-10">
          <h2 className="text-sm font-semibold text-indigo-950 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" /> Space Telemetry Playground
          </h2>
          <p className="text-xs text-indigo-900/70 leading-relaxed">
            Welcome to my frontend space analytics experiment! This application connects directly to open-source NASA data feeds, filters outlier values, and attempts to plot them cleanly. Tap through modules to test the integration engine.
          </p>
        </div>
      </div>

      <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />

      {/* Charts Grid */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="border-zinc-200/60 bg-white rounded-2xl shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold tracking-tight text-zinc-900">
                Data Stream Visualizer
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Continuous baseline values mapped dynamically across parsed nodes.
              </CardDescription>
            </div>
            <Activity className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <DataChart data={result?.series ?? []} />
          </CardContent>
        </Card>

        <Card className="border-zinc-200/60 bg-white rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold tracking-tight text-zinc-900">
                Flagged Outliers
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Items that broke past normal parameters.
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
                <span className="shrink-0 font-mono text-[10px] uppercase font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-md px-2 py-0.5">
                  {a.category}
                </span>
              </div>
            ))}
            {anomalies.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-1">
                <p className="text-xs font-medium text-zinc-500">Everything looks nominal</p>
                <p className="text-[11px] text-zinc-400">No telemetry spikes caught inside this slice.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Main Stream Registry */}
      <section className="border border-zinc-200/60 rounded-2xl bg-white shadow-sm overflow-hidden p-2">
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
      <section className="border border-zinc-200/60 rounded-2xl bg-white shadow-sm overflow-hidden p-2">
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-zinc-200/60 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Isolated Vectors</span>
            <span className="text-2xl font-bold tracking-tight text-zinc-900">{anomalies.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200/60 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Critical Spikes</span>
            <span className="text-2xl font-bold tracking-tight text-rose-600">{criticalCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>

        <div className="p-6 bg-white border border-zinc-200/60 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Minor Deviations</span>
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
            <ShieldAlert className="h-4 w-4 text-rose-500" /> Sandbox Anomaly Flags
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-mono bg-zinc-100 text-zinc-600 rounded-md border border-zinc-200/40">
            {datasetLabel}
          </span>
        </div>
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden p-2">
          <DataTable points={anomalies} datasetLabel="Isolated Deviations" />
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <Card className="border-zinc-200/60 bg-white rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="p-6 border-b border-zinc-100">
        <CardTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
          <Settings className="h-4 w-4 text-zinc-400" /> Dev Configuration & Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6 text-sm text-zinc-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-medium block text-zinc-800">
              NASA API Live Relay Gateway
            </span>
            <span className="text-xs text-zinc-400">Plugs your keys directly into the network requests.</span>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-mono border w-fit ${
            HAS_NASA_KEY 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-zinc-100 text-zinc-600 border-zinc-200"
          }`}>
            {HAS_NASA_KEY ? "live_mode_engaged" : "using_local_json_fallback"}
          </span>
        </div>
        
        <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl space-y-2">
          <p className="text-zinc-600 leading-relaxed text-xs">
            To stop using local mock files and connect directly to the live endpoints, append your unique key token variable into your project root configuration file:
          </p>
          <code className="inline-block font-mono text-[11px] rounded bg-white border border-zinc-200 px-2 py-1 text-zinc-800">
            VITE_NASA_API_KEY=[your_api_key_here]
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
          <BookOpen className="h-4 w-4 text-zinc-800" /> Project Log & Lab Guide
        </h2>
        <p className="text-xs text-zinc-400 max-w-2xl">
          A quick breakdown of how I am sorting data models and parsing anomalies inside this student layout app.
        </p>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="inline-flex items-center bg-zinc-200/60 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="kpis"
            className="text-xs font-medium px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm cursor-pointer transition-all"
          >
            My Custom Metrics
          </TabsTrigger>
          <TabsTrigger
            value="datasets"
            className="text-xs font-medium px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm cursor-pointer transition-all"
          >
            Connected Feeds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <Card className="border-zinc-200/60 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardContent className="p-2">
              <Table>
                <TableHeader className="bg-zinc-50/70">
                  <TableRow className="border-b border-zinc-100">
                    <TableHead className="w-[200px] text-xs font-semibold text-zinc-600">Metric Target</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-600">How I'm Tracking It</TableHead>
                    <TableHead className="w-[120px] text-xs font-semibold text-zinc-600">Priority Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <TableCell className="font-medium flex items-center gap-2 text-zinc-800 text-xs">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Outlier Flags
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400 leading-relaxed">
                      Catches high-risk items automatically when trajectory tracking factors cross or drift beyond normal coefficients.
                    </TableCell>
                    <TableCell>
                      <span className="inline-block text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-100 rounded px-2 py-0.5">CRITICAL_DEV</span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b border-zinc-100 hover:bg-zinc-50/50">
                    <TableCell className="font-medium flex items-center gap-2 text-zinc-800 text-xs">
                      <HeartPulse className="h-3.5 w-3.5 text-indigo-500" /> Core Node Stream Health
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400 leading-relaxed">
                      Measures total integrity checks. Dynamically calculates successful server query responses over a moving 24-hour sandbox testing window.
                    </TableCell>
                    <TableCell>
                      <span className="inline-block text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 rounded px-2 py-0.5">CALCULATED</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-zinc-200/60 bg-white rounded-2xl shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                <Database className="h-3.5 w-3.5 text-indigo-500" /> Near-Earth Objects (NeoWs)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-zinc-500 space-y-3">
              <p>Queries close-proximity asteroid trajectories relative to Earth's baseline orbit matrix.</p>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-300 mt-0.5">—</span> Pulls target diameters from historical open arrays.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-300 mt-0.5">—</span> Identifies approach vectors to help pinpoint anomaly filters.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/60 bg-white rounded-2xl shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                <Sun className="h-3.5 w-3.5 text-indigo-500" /> Space Weather (DONKI)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-zinc-500 space-y-3">
              <p>Pulls coronal mass ejections and solar flare event metrics from live satellite arrays.</p>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-300 mt-0.5">—</span> Simplifies magnetic flux data points down to manageable test matrices.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-300 mt-0.5">—</span> Helps isolate visual correlations when stream stability dips.
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-indigo-50/40 border border-indigo-100 rounded-xl">
      <div className="flex items-start gap-3">
        <Terminal className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-indigo-950 tracking-tight">Development Environment Active</p>
          <p className="text-[11px] text-indigo-900/70 leading-relaxed">
            Currently using local snapshot files to load data. Add a real API key in your `.env` settings anytime to test live telemetry calls.
          </p>
        </div>
      </div>
    </div>
  );
}

function TelemetryFailureAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-5 bg-rose-50/60 border border-rose-200/60 rounded-xl">
      <RefreshCw className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-rose-900 tracking-tight">API Fetch Issue</p>
        <p className="text-[11px] text-rose-700/90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
