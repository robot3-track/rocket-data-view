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
      <div className="flex min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans antialiased">
        
        {/* Custom sidebar wrapper to inject the Favicon image directly over the old brand block */}
        <div className="relative flex">
          <AppSidebar activeTab={tab} onSelect={setTab} />
          {/* Positional layer rendering Favicon.png natively into your top-left navigation frame */}
          <div className="absolute top-4 left-5 z-20 pointer-events-none flex items-center gap-3">
            <img 
              src="/Favicon.png" 
              alt="NASA Brand Logo" 
              className="h-8 w-8 object-contain rounded-lg shadow-sm"
              onError={(e) => {
                // Graceful fallback code if asset path changes locally
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
        
        <SidebarInset className="flex flex-col bg-transparent">
          {/* Approachable Sticky Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur transition-all">
            <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-800 transition-colors" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-slate-900 capitalize">
                  {tab === "ingestion" ? "Data Ingestion Workspace" : `${tab} View`}
                </h1>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  {loading ? (
                    <span className="flex items-center gap-1.5 text-sky-600">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching live system feeds...
                    </span>
                  ) : result ? (
                    `Synchronized at ${new Date(result.fetchedAt).toLocaleTimeString()}`
                  ) : (
                    "System ready"
                  )}
                </p>
              </div>
              <Badge variant="secondary" className="font-medium text-xs tracking-normal px-3 py-1 rounded-full bg-slate-100 text-slate-600 border-none">
                {HAS_NASA_KEY ? "Live network" : "Demo environment"}
              </Badge>
            </div>
          </header>

          {/* Main Layout Canvas Flow */}
          <main className="flex-1 space-y-6 p-8 max-w-[1400px] w-full mx-auto">
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

            {tab === "correlation" && <CorrelatedView />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/* ==========================================================================
   MODULAR WORKSPACE VIEWS (FIXED DESIGN.MD CARD PATTERNS)
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
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Cards fixed: converted from dark blocks to clean white elevated surfaces */}
      <KpiCard
        label="Active flags"
        value={result?.kpis.activeAnomalies ?? "0"}
        hint="Requires operational review"
        icon={AlertTriangle}
        tone="destructive"
        className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 rounded-2xl text-slate-900"
      />
      <KpiCard
        label="Observed samples"
        value={result ? result.kpis.totalDataPoints.toLocaleString() : "—"}
        hint={datasetLabel}
        icon={Database}
        tone="primary"
        className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 rounded-2xl text-slate-900"
      />
      <KpiCard
        label="Calculated health score"
        value={result ? `${result.kpis.systemHealth}%` : "—"}
        hint="Weighted window average"
        icon={HeartPulse}
        tone="success"
        className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 rounded-2xl text-slate-900"
      />
      <KpiCard
        label="Solar activity status"
        value={result?.kpis.solarActivity ?? "Nominal"}
        hint="Heliophysics baseline monitoring"
        icon={Sun}
        tone="warning"
        className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 rounded-2xl text-slate-900"
      />
    </section>
  );
}

function OverviewTab({ result, datasetLabel, anomalies, loading }: MetricsPanelProps & { anomalies: DataPoint[], loading: boolean }) {
  return (
    <div className="space-y-6">
      <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />
      
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight text-slate-900">Activity metric index — {datasetLabel}</CardTitle>
                <p className="text-xs text-slate-500">Continuous interval data stream visualizer</p>
              </div>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <DataChart data={result?.series ?? []} />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-tight text-slate-900">Flagged data anomalies</CardTitle>
            <p className="text-xs text-slate-500">Outliers exceeding baseline parameters</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {anomalies.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs transition-colors hover:bg-slate-50"
              >
                <span className="font-medium truncate pr-4 text-slate-700">{a.label}</span>
                <Badge variant="outline" className="shrink-0 font-medium rounded-full bg-red-50 text-red-700 border-red-200/50 px-2 py-0.5">
                  {a.category}
                </Badge>
              </div>
            ))}
            {anomalies.length === 0 && !loading && (
              <p className="text-xs text-slate-400 py-6 text-center">No structural variations logged in this scope window.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="border border-slate-200/80 rounded-2xl bg-white shadow-sm overflow-hidden">
        <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
      </section>
    </div>
  );
}

function IngestionTab({ dataset, result, datasetLabel, loading, onDatasetChange, onForceReload }: IngestionTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
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
      <section className="border border-slate-200/80 rounded-2xl bg-white shadow-sm overflow-hidden">
        <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
      </section>
    </div>
  );
}

function AnomaliesTab({ result, datasetLabel, anomalies }: MetricsPanelProps & { anomalies: any[] }) {
  const criticalCount = anomalies.filter((p: any) => p.isAnomaly && Math.abs(p.value || 0) > 80).length;
  const warningCount = anomalies.length - criticalCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dynamic Summary Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight block">Detected Vectors</span>
            <span className="text-xl font-bold text-slate-900">{anomalies.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight block">Critical Triggers</span>
            <span className="text-xl font-bold text-rose-600">{criticalCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight block">Warning Deviation Flags</span>
            <span className="text-xl font-bold text-amber-600">{warningCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500">
            <Activity className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Filtered Incident Table Module */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500" /> Active Incident Record Log
          </span>
          <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-md font-mono">
            {datasetLabel}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden p-2">
          <DataTable points={anomalies} datasetLabel="Anomaly Threshold Isolations" />
        </div>
      </div>
    </div>
  );
}


function SettingsTab() {
  return (
    <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-400" /> Pipeline Access Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600">
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <div>
            <span className="font-medium block text-slate-800">NASA Open Data integration pipeline</span>
            <span className="text-xs text-slate-400">Secure connection configuration status</span>
          </div>
          <Badge className={HAS_NASA_KEY ? "bg-green-50 text-green-700 border-green-200 px-3 py-1 rounded-full" : "bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 rounded-full"}>
            {HAS_NASA_KEY ? "Operational" : "Snapshot Mode"}
          </Badge>
        </div>
        <p className="text-slate-500 leading-relaxed text-xs">
          The pipeline maps variables safely by evaluating your infrastructure parameters file configuration (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">VITE_NASA_API_KEY</code>). 
          To provision keys across client nodes cleanly, apply environment modifications inside your central workspace control layer.
        </p>
      </CardContent>
    </Card>
  );
}

function DocumentationTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-sky-600" /> Operations Manual & Index Formulas
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl">
          Overview of metric calculations, tracking anomalies, and system pipeline parameters.
        </p>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl mb-4">
          <TabsTrigger value="kpis" className="text-xs font-medium px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer transition-all">Core calculations</TabsTrigger>
          <TabsTrigger value="datasets" className="text-xs font-medium px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer transition-all">Dataset reference</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900">Performance Logic Rules</CardTitle>
              <CardDescription className="text-xs text-slate-400">How data streams are indexed and categorized dynamically.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="border border-slate-100 rounded-lg overflow-hidden">
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100">
                    <TableHead className="w-[180px] text-xs font-semibold text-slate-600">Metric block</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Logic parameter description</TableHead>
                    <TableHead className="w-[120px] text-xs font-semibold text-slate-600">Severity level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-slate-100 hover:bg-slate-50/50">
                    <TableCell className="font-medium flex items-center gap-1.5 text-slate-800 text-xs">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" /> Active flags
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 leading-relaxed">
                      Tracks safety indicators. In <span className="text-slate-800">NEO Asteroids</span>, it parses objects flagged dangerous. In space flares, it monitors high solar flux parameters.
                    </TableCell>
                    <TableCell><Badge className="bg-red-50 text-red-700 border-none rounded-full" variant="destructive">Urgent</Badge></TableCell>
                  </TableRow>
                  <TableRow className="border-b border-slate-100 hover:bg-slate-50/50">
                    <TableCell className="font-medium flex items-center gap-1.5 text-slate-800 text-xs">
                      <HeartPulse className="h-3.5 w-3.5 text-green-500" /> Health index
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 leading-relaxed">
                      Calculates general system stability out of 100%. Hazards apply dynamic deductions cleanly down to established safety baselines.
                    </TableCell>
                    <TableCell><Badge className="bg-slate-100 text-slate-700 border-none rounded-full" variant="outline">Variable</Badge></TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50/50">
                    <TableCell className="font-medium flex items-center gap-1.5 text-slate-800 text-xs">
                      <Zap className="h-3.5 w-3.5 text-amber-500" /> Solar status
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 leading-relaxed">
                      Evaluates current stellar weather fields tracked across baseline indexes ranging seamlessly between Quiet and Severe intervals.
                    </TableCell>
                    <TableCell><Badge className="bg-amber-50 text-amber-700 border-none rounded-full" variant="secondary">Observation</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-sky-600" /> Near-Earth Objects (NeoWs)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 space-y-2">
              <p>Monitors rolling asteroid orbital paths crossing daily local space grids.</p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                <li>Logs maximum calculated diameters mapped accurately in raw meters.</li>
                <li>Calculates intersection density thresholds to predict flight tracks cleanly.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-600" /> Space Weather (DONKI)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 space-y-2">
              <p>Tracks solar magnetic storms and plasma streams across rolling intervals.</p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                <li>Translates geometric flux indicators into friendly status points.</li>
                <li>Flags high-charge mass ejections reaching planetary fields.</li>
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
    <Alert className="border-amber-200 bg-amber-50 text-amber-900 rounded-xl shadow-sm animate-fade-in">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-xs font-semibold tracking-tight">Running in demo snapshot mode</AlertTitle>
      <AlertDescription className="text-xs text-amber-700/90 mt-0.5">
        Displaying standard localized cache data. To process real-time streams directly, apply your secret token variable inside your deployment architecture settings dashboard.
      </AlertDescription>
    </Alert>
  );
}

function TelemetryFailureAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-xl shadow-sm animate-fade-in">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-xs font-semibold tracking-tight">Connection anomaly detected</AlertTitle>
      <AlertDescription className="text-xs text-red-700/90 mt-0.5">{message}</AlertDescription>
    </Alert>
  );
}
