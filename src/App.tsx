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
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/10">
        <AppSidebar activeTab={tab} onSelect={setTab} />
        
        <SidebarInset className="flex flex-col">
          {/* Global Sticky Header */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur transition-all">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-sm font-semibold tracking-tight capitalize">
                  {tab === "ingestion" ? "NASA API Ingestion Workspace" : `${tab} View`}
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {loading ? (
                    <span className="flex items-center gap-1.5 text-primary animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" /> Synchronizing telemetry...
                    </span>
                  ) : result ? (
                    `Last telemetry sync: ${new Date(result.fetchedAt).toLocaleString()}`
                  ) : (
                    "System uninitialized"
                  )}
                </p>
              </div>
              <Badge variant={HAS_NASA_KEY ? "outline" : "secondary"} className="font-mono tracking-wide px-2.5 py-0.5">
                {HAS_NASA_KEY ? "● Live API Pipeline" : "○ Demo Token Fallback"}
              </Badge>
            </div>
          </header>

          {/* Context Layout Portal */}
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
      />
      <KpiCard
        label="Total Sample Points"
        value={result ? result.kpis.totalDataPoints.toLocaleString() : "—"}
        hint={datasetLabel}
        icon={Database}
        tone="primary"
      />
      <KpiCard
        label="System Health"
        value={result ? `${result.kpis.systemHealth}%` : "—"}
        hint="Composite signal score"
        icon={HeartPulse}
        tone="success"
      />
      <KpiCard
        label="Solar Activity Index"
        value={result?.kpis.solarActivity ?? "—"}
        hint="Heliophysics baseline"
        icon={Sun}
        tone="warning"
      />
    </section>
  );
}

function OverviewTab({ result, datasetLabel, anomalies, loading }: MetricsPanelProps & { anomalies: DataPoint[], loading: boolean }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />
      
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border-border/40 bg-card/40 backdrop-blur xl:col-span-2">
          {/* FIXED CLOSING TAG BELOW */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight">Telemetry Matrix — {datasetLabel}</CardTitle>
                <p className="text-xs text-muted-foreground">Interactive contextual time-series index</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <DataChart data={result?.series ?? []} />
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">Critical Anomalies</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Top active safety flags</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {anomalies.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-xs transition-colors hover:bg-background/80"
              >
                <span className="font-medium truncate pr-4">{a.label}</span>
                <Badge variant="destructive" className="shrink-0 font-mono text-[10px] uppercase">
                  {a.category}
                </Badge>
              </div>
            ))}
            {anomalies.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground py-4 text-center">No structural anomalies detected within dataset scope.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="border rounded-xl bg-card/20 backdrop-blur">
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
      <section className="border rounded-xl bg-card/20 backdrop-blur">
        <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
      </section>
    </div>
  );
}

function AnomaliesTab({ result, datasetLabel, anomalies }: MetricsPanelProps & { anomalies: DataPoint[] }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-xl border bg-card/20 backdrop-blur">
        <DataTable points={anomalies} datasetLabel={`${datasetLabel} (Filtered Anomalies)`} />
      </div>
    </div>
  );
}

/****************************************************************************
 * ENVIRONMENT MANAGEMENT SETTINGS
 ****************************************************************************/
function SettingsTab() {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur animate-fade-in">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" /> Environment Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between border-b pb-3 border-border/40">
          <div>
            <span className="font-medium block">NASA Open Data Framework Connection</span>
            <span className="text-xs text-muted-foreground">Validation token infrastructure route</span>
          </div>
          <Badge variant={HAS_NASA_KEY ? "default" : "destructive"}>
            {HAS_NASA_KEY ? "Active Operational Pipeline" : "Token Infrastructure Unset"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Runtime parameters expect client architecture keys mapped to <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">VITE_NASA_API_KEY</code>. 
          Modify variables within your active secure environment parameters (such as your Vercel Project Dashboards) followed by code pipeline builds to cycle system tunnels cleanly.
        </p>
      </CardContent>
    </Card>
  );
}

/****************************************************************************
 * OPERATIONS MANUAL & SYSTEMS GLOSSARY VIEW
 ****************************************************************************/
function DocumentationTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Telemetry Glossary & Operations Manual
        </h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Comprehensive review of mathematical conversions, metric scoring formulas, and ingestion pipelines.
        </p>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="kpis">Core Calculations & KPIs</TabsTrigger>
          <TabsTrigger value="datasets">Dataset Pipelines</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Performance Parameters</CardTitle>
              <CardDescription>How calculation kernels map alerts and system scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Metric Card</TableHead>
                    <TableHead>Calculation & Core Logic</TableHead>
                    <TableHead className="w-[120px]">Impact Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Active Anomalies
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground leading-relaxed">
                      Tracks safety hazard flags. In <strong className="text-foreground font-normal">NEO Asteroids</strong>, it counts rows where <code className="text-destructive font-mono text-[11px]">is_potentially_hazardous_asteroid</code> evaluates true. In <strong className="text-foreground font-normal">Solar Flares</strong>, it counts high-radiation M-Class and X-Class spikes.
                    </TableCell>
                    <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-success" /> System Health
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground leading-relaxed">
                      Calculates situational baseline stability out of 100%. Asteroid hazards deduct 2% each (floor 40%). M-class solar flares deduct 3%, and X-class flares deduct 10% (floor 30%).
                    </TableCell>
                    <TableCell><Badge variant="outline">Dynamic Risk</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-warning" /> Solar Activity
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground leading-relaxed">
                      Real-time space weather classification parsed from the Space Weather Database of Notifications, Knowledge, and Information (DONKI). Range scales across **Quiet**, **Moderate**, and **Severe (X-class)**.
                    </TableCell>
                    <TableCell><Badge variant="secondary">Heliophysics</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Database className="h-4 w-4 text-primary" /> Near-Earth Objects (NeoWs)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Queries orbital vectors on a rolling 7-day loop window tied to current system time.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Value Mapping:</strong> Matches maximum estimated asteroid diameter in whole meters.</li>
                <li><strong>Data Charting:</strong> Compiles sum of intersecting orbits traversing daily local frames.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-warning" /> Space Weather (DONKI)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Monitors stellar radiation flare activities along a rolling 30-day index cycle path.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Value Translation:</strong> Logs logarithmic scales: A (0.1), B (1), C (10), M (100), X (1000).</li>
                <li><strong>Anomalies:</strong> Flags any core coronal mass explosion tracking higher than C-class bands.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-sky-400" /> Mars Weather Index
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Ingests atmospheric weather streams relayed straight from the Mars InSight Lander array.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Metrics Split:</strong> Maps temperature scales (°C), pressure waves (Pa), and surface wind (m/s).</li>
                <li><strong>Anomalies:</strong> Flags temperatures dipping lower than -90°C or wind gusts breaking 15 m/s.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-emerald-400" /> Astronomy Media Feed (APOD)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>Samples a 10-point node slice array from the Astronomy Picture of the Day infrastructure.</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong>Value Mapping:</strong> Evaluates character length sizes inside the contextual paragraphs.</li>
                <li><strong>Anomalies:</strong> Flags content objects rendering external hypermedia formats (such as space video strings) instead of simple image frames.</li>
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
    <Alert className="border-warning/30 bg-warning/5 text-warning-foreground animate-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold tracking-tight">Active Warning: Shared DEMO_KEY Fallback Mode</AlertTitle>
      <AlertDescription className="text-xs opacity-90">
        Global application token config <code className="rounded bg-muted font-mono px-1 py-0.5 text-[11px]">VITE_NASA_API_KEY</code> is unpopulated. 
        Falling back to standard limits. Please populate environment values inside your active hosting parameters to upgrade stream boundaries.
      </AlertDescription>
    </Alert>
  );
}

function TelemetryFailureAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="bg-destructive/5 animate-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold tracking-tight">System Fetch Interface Terminated</AlertTitle>
      <AlertDescription className="text-xs font-mono mt-1 opacity-90">{message}</AlertDescription>
    </Alert>
  );
}
