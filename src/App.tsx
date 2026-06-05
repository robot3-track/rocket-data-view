import { useEffect, useMemo, useState, useCallback } from "react";
import { Activity, AlertTriangle, Database, HeartPulse, Sun, Loader2, BookOpen, HelpCircle, ShieldAlert, Zap, Thermometer, Settings } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/workspace/AppSidebar";
import { KpiCard } from "@/components/workspace/KpiCard";
import { DataChart } from "@/components/workspace/DataChart";
import { IngestionPanel } from "@/components/workspace/IngestionPanel";
import { DataTable } from "@/components/workspace/DataTable";

// Custom Tabs Primitives from your UI components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  DATASETS,
  HAS_NASA_KEY,
  fetchDataset,
  type AnalysisResult,
  type DatasetId,
  type DataPoint,
} from "@/services/nasa";

type Tab = "overview" | "ingestion" | "anomalies" | "settings" | "documentation";

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
      setError(err instanceof Error ? err.message : "An unexpected error occurred fetching telemetry.");
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
      <div className="flex min-h-screen w-full bg-[#030712] text-slate-100 font-mono selection:bg-sky-500/20">
        <AppSidebar activeTab={tab} onSelect={setTab} />
        
        <SidebarInset className="flex flex-col bg-transparent">
          {/* Global Sticky Header */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-white/10 bg-[#030712]/80 px-6 backdrop-blur transition-all">
            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-200" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                  {tab === "ingestion" ? "NASA API Ingestion Workspace" : `${tab} View`}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {loading ? (
                    <span className="flex items-center gap-1.5 text-sky-400 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" /> Synchronizing telemetry...
                    </span>
                  ) : result ? (
                    `Last telemetry sync: ${new Date(result.fetchedAt).toLocaleString()}`
                  ) : (
                    "System uninitialized"
                  )}
                </p>
              </div>
              <Badge variant={HAS_NASA_KEY ? "outline" : "secondary"} className="font-mono tracking-wide px-2.5 py-0.5 border-white/10 bg-white/5 text-slate-300">
                {HAS_NASA_KEY ? "● Live API Pipeline" : "○ Demo Token Fallback"}
              </Badge>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6 max-w-[1600px] w-full mx-auto">
            {!HAS_NASA_KEY && <KeyMissingAlert />}
            {error && <TelemetryFailureAlert message={error} />}

            {tab === "overview" && (
              <OverviewTab 
                result={result} 
                datasetLabel={datasetLabel} 
                anomalies={anomalies} 
                loading={loading} 
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/* ==========================================================================
   MODULAR WORKSPACE ROUTING VIEWS
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
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Active Anomalies"
        value={result?.kpis.activeAnomalies ?? "—"}
        hint="Flagged in current window"
        icon={AlertTriangle}
        tone="destructive"
        className="bg-[#0b1329] border-white/5 p-4 rounded-xl"
      />
      <KpiCard
        label="Total Sample Points"
        value={result ? result.kpis.totalDataPoints.toLocaleString() : "—"}
        hint={datasetLabel}
        icon={Database}
        tone="primary"
        className="bg-[#0b1329] border-white/5 p-4 rounded-xl"
      />
      <KpiCard
        label="System Health"
        value={result ? `${result.kpis.systemHealth}%` : "—"}
        hint="Composite signal score"
        icon={HeartPulse}
        tone="success"
        className="bg-[#0b1329] border-white/5 p-4 rounded-xl"
      />
      <KpiCard
        label="Solar Activity Index"
        value={result?.kpis.solarActivity ?? "—"}
        hint="Heliophysics baseline"
        icon={Sun}
        tone="warning"
        className="bg-[#0b1329] border-white/5 p-4 rounded-xl"
      />
    </section>
  );
}

function OverviewTab({ result, datasetLabel, anomalies, loading }: MetricsPanelProps & { anomalies: DataPoint[], loading: boolean }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />
      
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border-white/5 bg-[#0b1329] rounded-xl xl:col-span-2">
          {/* Tag matches correctly </CardHeader> */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-200">Telemetry Matrix — {datasetLabel}</CardTitle>
                <p className="text-xs text-slate-500">Interactive contextual time-series index</p>
              </div>
              <Activity className="h-4 w-4 text-sky-400" />
            </div>
          </CardHeader>
          <CardContent>
            <DataChart data={result?.series ?? []} />
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#0b1329] rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-slate-200">Critical Anomalies</CardTitle>
            <p className="text-xs text-slate-500 font-medium">Top active safety flags</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {anomalies.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-[#030712]/60 px-3 py-2 text-xs transition-colors hover:bg-white/5"
              >
                <span className="font-medium truncate pr-4 text-slate-300">{a.label}</span>
                <Badge variant="destructive" className="shrink-0 font-mono text-[10px] uppercase bg-red-950/40 text-red-400 border-red-900/30">
                  {a.category}
                </Badge>
              </div>
            ))}
            {anomalies.length === 0 && !loading && (
              <p className="text-xs text-slate-500 py-4 text-center">No structural anomalies detected within dataset scope.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="border border-white/5 rounded-xl bg-[#0b1329]/40 backdrop-blur">
        <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
      </section>
    </div>
  );
}

function IngestionTab({ dataset, result, datasetLabel, loading, onDatasetChange, onForceReload }: IngestionTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-start">
        <div className="md:col-span-1">
          <IngestionPanel
            dataset={dataset}
            onDatasetChange={onDatasetChange}
            onAnalyze={onForceReload}
            loading={loading}
          />
        </div>
        <div className="md:col-span-2">
          <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />
        </div>
      </div>
      <section className="border border-white/5 rounded-xl bg-[#0b1329]/40 backdrop-blur">
        <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
      </section>
    </div>
  );
}

function AnomaliesTab({ result, datasetLabel, anomalies }: MetricsPanelProps & { anomalies: DataPoint[] }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl border border-white/5 bg-[#0b1329]/40 backdrop-blur">
        <DataTable points={anomalies} datasetLabel={`${datasetLabel} (Filtered Anomalies)`} />
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <Card className="border-white/5 bg-[#0b1329] rounded-xl animate-fade-in">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-400" /> Environment Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs text-slate-300">
        <div className="flex items-center justify-between border-b pb-3 border-white/5">
          <div>
            <span className="font-medium block text-slate-200">NASA Open Data Framework Connection</span>
            <span className="text-[11px] text-slate-500">Validation token infrastructure route</span>
          </div>
          <Badge variant={HAS_NASA_KEY ? "default" : "destructive"} className={HAS_NASA_KEY ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" : "bg-red-950/40 text-red-400 border-red-900/30"}>
            {HAS_NASA_KEY ? "Active Operational Pipeline" : "Token Infrastructure Unset"}
          </Badge>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Runtime parameters expect client architecture keys mapped to <code className="rounded bg-[#030712] border border-white/5 px-1.5 py-0.5 font-mono text-[11px] text-sky-400">VITE_NASA_API_KEY</code>. 
          Modify variables within your active secure environment parameters followed by code pipeline builds to cycle system tunnels cleanly.
        </p>
      </CardContent>
    </Card>
  );
}

function DocumentationTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-base font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-sky-400" /> Telemetry Glossary & Operations Manual
        </h2>
        <p className="text-xs text-slate-500 max-w-3xl">
          Comprehensive review of mathematical conversions, metric scoring formulas, and ingestion pipelines.
        </p>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 bg-[#030712] border border-white/5 p-1 rounded-lg">
          <TabsTrigger value="kpis" className="text-xs uppercase tracking-wider cursor-pointer data-[state=active]:bg-[#0b1329] data-[state=active]:text-sky-400">Core Calculations</TabsTrigger>
          <TabsTrigger value="datasets" className="text-xs uppercase tracking-wider cursor-pointer data-[state=active]:bg-[#0b1329] data-[state=active]:text-sky-400">Dataset Pipelines</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <Card className="border-white/5 bg-[#0b1329] rounded-xl">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-slate-200">Performance Parameters</CardTitle>
              <CardDescription className="text-xs text-slate-500">How calculation kernels map alerts and system scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="border border-white/5">
                <TableHeader className="bg-[#030712]/50">
                  <TableRow className="border-b border-white/5">
                    <TableHead className="w-[180px] text-xs uppercase tracking-wider text-slate-400">Metric Card</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-slate-400">Calculation & Core Logic</TableHead>
                    <TableHead className="w-[120px] text-xs uppercase tracking-wider text-slate-400">Impact Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="font-semibold flex items-center gap-1.5 text-slate-300 text-xs">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-400" /> Active Anomalies
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-400 leading-relaxed">
                      Tracks safety hazard flags. In <strong className="text-slate-200 font-normal">NEO Asteroids</strong>, it counts rows where <code className="text-red-400 font-mono text-[11px]">is_potentially_hazardous_asteroid</code> evaluates true.
                    </TableCell>
                    <TableCell><Badge className="bg-red-950/40 text-red-400 border-red-900/30" variant="destructive">Critical</Badge></TableCell>
                  </TableRow>
                  <TableRow className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="font-semibold flex items-center gap-1.5 text-slate-300 text-xs">
                      <HeartPulse className="h-3.5 w-3.5 text-emerald-400" /> System Health
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-400 leading-relaxed">
                      Calculates stability out of 100%. Asteroid hazards deduct 2% each (floor 40%). M-class solar flares deduct 3%, and X-class flares deduct 10% (floor 30%).
                    </TableCell>
                    <TableCell><Badge className="bg-slate-900 text-slate-300 border-white/10" variant="outline">Dynamic Risk</Badge></TableCell>
                  </TableRow>
                  <TableRow className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-semibold flex items-center gap-1.5 text-slate-300 text-xs">
                      <Zap className="h-3.5 w-3.5 text-amber-400" /> Solar Activity
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-400 leading-relaxed">
                      Space weather classification parsed from DONKI streams. Range scales across <strong>Quiet</strong>, <strong>Moderate</strong>, and <strong>Severe (X-class)</strong>.
                    </TableCell>
                    <TableCell><Badge className="bg-amber-950/40 text-amber-400 border-amber-900/30" variant="secondary">Heliophysics</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-white/5 bg-[#0b1329] rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-sky-400" /> Near-Earth Objects (NeoWs)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 space-y-2">
              <p>Queries orbital vectors on a rolling 7-day loop window tied to current system time.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Value Mapping:</strong> Matches maximum estimated asteroid diameter in whole meters.</li>
                <li><strong>Data Charting:</strong> Compiles sum of intersecting orbits traversing daily local frames.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#0b1329] rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-amber-400" /> Space Weather (DONKI)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 space-y-2">
              <p>Monitors stellar radiation flare activities along a rolling 30-day index cycle path.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Value Translation:</strong> Logs logarithmic scales: A (0.1), B (1), C (10), M (100), X (1000).</li>
                <li><strong>Anomalies:</strong> Flags any core coronal mass explosion tracking higher than C-class bands.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#0b1329] rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-sky-400" /> Mars Weather Index
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 space-y-2">
              <p>Ingests atmospheric weather streams relayed straight from the Mars InSight Lander array.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Metrics Split:</strong> Maps temperature scales (°C), pressure waves (Pa), and surface wind (m/s).</li>
                <li><strong>Anomalies:</strong> Flags temperatures dipping lower than -90°C or wind gusts breaking 15 m/s.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#0b1329] rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-emerald-400" /> Astronomy Media Feed (APOD)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 space-y-2">
              <p>Samples a 10-point node slice array from the Astronomy Picture of the Day infrastructure.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Value Mapping:</strong> Evaluates character length sizes inside the contextual paragraphs.</li>
                <li><strong>Anomalies:</strong> Flags content objects rendering external hypermedia formats instead of simple image frames.</li>
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
    <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-400 rounded-lg animate-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-xs font-semibold uppercase tracking-wider">Active Warning: Shared DEMO_KEY Fallback Mode</AlertTitle>
      <AlertDescription className="text-[11px] text-slate-400 mt-1">
        Global application token config <code className="rounded bg-[#030712] border border-white/5 font-mono px-1 py-0.5 text-[11px] text-amber-400">VITE_NASA_API_KEY</code> is unpopulated. 
        Falling back to standard limits. Please populate environment values inside your active hosting parameters to upgrade stream boundaries.
      </AlertDescription>
    </Alert>
  );
}

function TelemetryFailureAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 text-red-400 rounded-lg animate-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-xs font-semibold uppercase tracking-wider">System Fetch Interface Terminated</AlertTitle>
      <AlertDescription className="text-[11px] text-slate-400 font-mono mt-1">{message}</AlertDescription>
    </Alert>
  );
}
