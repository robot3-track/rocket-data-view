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
        err instanceof Error ? err.message : "Could not retrieve telemetry from the selected NASA endpoints."
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
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
        
        {/* Brand/Identity Frame Container */}
        <div className="relative flex">
          <AppSidebar activeTab={tab} onSelect={setTab} />
          <div className="absolute top-5 left-6 z-20 pointer-events-none flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <SidebarInset className="flex flex-col bg-transparent min-w-0 overflow-x-hidden">
          {/* Main Layout Header */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background px-6 md:px-10 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground transition-colors shrink-0" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span>My Capstone Project</span>
                  <ChevronRight className="h-3 w-3 text-border" />
                  <span className="text-foreground font-mono">
                    {tab === "ingestion" ? "data lab" : `${tab}`}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground">
                  {loading ? (
                    <span className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" /> querying telemetry streams...
                    </span>
                  ) : result ? (
                    `last successful fetch: ${new Date(result.fetchedAt).toLocaleTimeString()}`
                  ) : (
                    "status: local mock engine active"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium font-mono border border-border bg-muted text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${HAS_NASA_KEY ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                {HAS_NASA_KEY ? "CONNECTED LIVE API" : "DEVELOPMENT MOCK MODE"}
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
        hint="Data points hitting custom threshold criteria"
        icon={AlertTriangle}
        tone="destructive"
        className="bg-card border border-border p-6 text-card-foreground"
      />
      <KpiCard
        label="Parsed Rows"
        value={result ? result.kpis.totalDataPoints.toLocaleString() : "—"}
        hint={`Source: ${datasetLabel}`}
        icon={Database}
        tone="primary"
        className="bg-card border border-border p-6 text-card-foreground"
      />
      <KpiCard
        label="Calculated Stream Health"
        value={result ? `${result.kpis.systemHealth}%` : "—"}
        hint="Moving average validation checklist rate"
        icon={HeartPulse}
        tone="success"
        className="bg-card border border-border p-6 text-card-foreground"
      />
      <KpiCard
        label="Solar Magnetics Index"
        value={result?.kpis.solarActivity ?? "Nominal"}
        hint="Global baseline factor for solar winds"
        icon={Sun}
        tone="warning"
        className="bg-card border border-border p-6 text-card-foreground"
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
      {/* Segment Control Tab Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-5">
        <div className="flex bg-muted p-0.5 max-w-full overflow-x-auto whitespace-nowrap">
          {[
            { id: "neo", label: "Near Earth Asteroids" },
            { id: "mars-weather", label: "Mars Weather (InSight)" },
            { id: "donki-flr", label: "Solar Flares" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => onDatasetChange(d.id)}
              className={`px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeDataset === d.id
                  ? "bg-card text-foreground shadow-sm border border-border font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-wider text-muted-foreground uppercase bg-muted border border-border px-3 py-1 w-fit">
          <Terminal className="h-3 w-3 text-primary" />
           active module:{" "}
          <span className="font-bold text-foreground">
            {activeDataset === "neo" && "NEO PARSER"}
            {activeDataset === "mars-weather" && "MARS SOL DECODING"}
            {activeDataset === "donki-flr" && "SOLAR FLARE MATRICES"}
          </span>
        </span>
      </div>

      {/* Intro Student Context Banner */}
      <div className="p-6 bg-card border border-border">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Space Telemetry Interface
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This interface connects to open source NASA data feeds, screens outlier telemetry metrics, and graphs baseline deviations across active chronological logs.
          </p>
        </div>
      </div>

      <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />

      {/* Charts Grid Canvas */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold tracking-tight text-card-foreground">
                Data Stream Visualizer
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Continuous baseline values mapped dynamically across parsed nodes.
              </CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <DataChart data={result?.series ?? []} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold tracking-tight text-card-foreground">
                Flagged Outliers
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Items that broke past normal parameters.
              </CardDescription>
            </div>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-2">
            {anomalies.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border border-border bg-muted px-4 py-3 text-xs transition-colors hover:bg-secondary"
              >
                <span className="font-medium text-card-foreground truncate pr-3">{a.label}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase font-semibold text-foreground bg-background border border-border px-2 py-0.5">
                  {a.category}
                </span>
              </div>
            ))}
            {anomalies.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Everything looks nominal</p>
                <p className="text-[11px] text-muted-foreground">No telemetry spikes caught inside this slice.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Main Stream Registry */}
      <section className="border border-border bg-card shadow-sm overflow-hidden p-2">
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
      <section className="border border-border bg-card shadow-sm overflow-hidden p-2">
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
        <div className="p-6 bg-card border border-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Isolated Vectors</span>
            <span className="text-2xl font-bold tracking-tight text-card-foreground">{anomalies.length}</span>
          </div>
          <div className="p-3 bg-muted text-muted-foreground border border-border">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>

        <div className="p-6 bg-card border border-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Critical Spikes</span>
            <span className="text-2xl font-bold tracking-tight text-card-foreground">{criticalCount}</span>
          </div>
          <div className="p-3 bg-muted text-muted-foreground border border-border">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>

        <div className="p-6 bg-card border border-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Minor Deviations</span>
            <span className="text-2xl font-bold tracking-tight text-card-foreground">{warningCount}</span>
          </div>
          <div className="p-3 bg-muted text-muted-foreground border border-border">
            <Activity className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-semibold text-card-foreground uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" /> Sandbox Anomaly Flags
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground border border-border">
            {datasetLabel}
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden p-2">
          <DataTable points={anomalies} datasetLabel="Isolated Deviations" />
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-6 border-b border-border">
        <CardTitle className="text-base font-semibold text-card-foreground flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" /> Dev Configuration and Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-medium block text-card-foreground">
              NASA API Live Relay Gateway
            </span>
            <span className="text-xs text-muted-foreground">Plugs keys directly into network requests.</span>
          </div>
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium font-mono border border-border bg-muted text-muted-foreground">
            {HAS_NASA_KEY ? "live mode engaged" : "using local json fallback"}
          </span>
        </div>
        
        <div className="bg-muted border border-border p-4 space-y-2">
          <p className="text-muted-foreground leading-relaxed text-xs">
            To switch off snapshot modules and connect directly to server aggregates, add the environmental variable directly within your setup root configuration settings:
          </p>
          <code className="inline-block font-mono text-[11px] bg-background border border-border px-2 py-1 text-foreground">
            VITE NASA API KEY=[your api key here]
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
        <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" /> Project Log and Lab Guide
        </h2>
        <p className="text-xs text-muted-foreground max-w-2xl">
          A breakdown of how data models are sorted and anomalies are processed inside this application context.
        </p>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="inline-flex items-center bg-muted p-0.5 mb-6">
          <TabsTrigger
            value="kpis"
            className="text-xs font-medium px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer transition-all"
          >
            My Custom Metrics
          </TabsTrigger>
          <TabsTrigger
            value="datasets"
            className="text-xs font-medium px-4 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer transition-all"
          >
            Connected Feeds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-2">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow className="border-b border-border">
                    <TableHead className="w-[200px] text-xs font-semibold text-muted-foreground">Metric Target</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Tracking Logic</TableHead>
                    <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground">Priority Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-border hover:bg-muted">
                    <TableCell className="font-medium flex items-center gap-2 text-card-foreground text-xs">
                      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" /> Outlier Flags
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground leading-relaxed">
                      Catches target data indices automatically when trajectory components drift past specified baseline tolerances.
                    </TableCell>
                    <TableCell>
                      <span className="inline-block text-[10px] font-mono font-semibold bg-muted text-muted-foreground border border-border px-2 py-0.5">CRITICAL DEV</span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b border-border hover:bg-muted">
                    <TableCell className="font-medium flex items-center gap-2 text-card-foreground text-xs">
                      <HeartPulse className="h-3.5 w-3.5 text-muted-foreground" /> Core Node Stream Health
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground leading-relaxed">
                      Measures verification indicators. Computes successful mock engine arrays against dynamic calculation criteria over rolling 24 hour windows.
                    </TableCell>
                    <TableCell>
                      <span className="inline-block text-[10px] font-mono font-semibold bg-muted text-muted-foreground border border-border px-2 py-0.5">CALCULATED</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-semibold text-card-foreground flex items-center gap-2 uppercase tracking-wider">
                <Database className="h-3.5 w-3.5 text-muted-foreground" /> Near Earth Objects (NeoWs)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-muted-foreground space-y-3">
              <p>Queries approach vectors relative to Earth orbit projections.</p>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-border mt-0.5">—</span> Extracts object dimensions directly from historical records.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-border mt-0.5">—</span> Filters out safe values using custom parsing parameters.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-semibold text-card-foreground flex items-center gap-2 uppercase tracking-wider">
                <Sun className="h-3.5 w-3.5 text-muted-foreground" /> Space Weather (DONKI)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-muted-foreground space-y-3">
              <p>Pulls solar events and coronal disruptions down into simplified tabular metrics.</p>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-border mt-0.5">—</span> Translates flux densities into chart indices.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-border mt-0.5">—</span> Identifies timestamp correlations during telemetry drops.
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-card border border-border">
      <div className="flex items-start gap-3">
        <Terminal className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-card-foreground tracking-tight">Development Environment Active</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Currently using local snapshot files to simulate telemetry. Add an environment variable key to test live gateway responses.
          </p>
        </div>
      </div>
    </div>
  );
}

function TelemetryFailureAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-5 bg-card border border-destructive">
      <RefreshCw className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-destructive tracking-tight">API Fetch Issue</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
