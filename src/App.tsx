import { useEffect, useMemo, useState, useCallback } from "react";
import { Activity, AlertTriangle, Database, HeartPulse, Sun, Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/workspace/AppSidebar";
import { KpiCard } from "@/components/workspace/KpiCard";
import { DataChart } from "@/components/workspace/DataChart";
import { IngestionPanel } from "@/components/workspace/IngestionPanel";
import { DataTable } from "@/components/workspace/DataTable";
import {
  DATASETS,
  HAS_NASA_KEY,
  fetchDataset,
  type AnalysisResult,
  type DatasetId,
  type DataPoint,
} from "@/services/nasa";

type Tab = "overview" | "ingestion" | "anomalies" | "settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dataset, setDataset] = useState<DatasetId>("neo");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized label lookup for runtime performance
  const datasetLabel = useMemo(() => {
    const targetId = result?.dataset ?? dataset;
    return DATASETS.find((d) => d.id === targetId)?.label ?? "Dataset";
  }, [result?.dataset, dataset]);

  // Clean data-filtering slice
  const anomalies = useMemo(() => {
    return result?.points.filter((p) => p.anomaly) ?? [];
  }, [result?.points]);

  // Main execution payload wrapped to prevent callback reference thrashing
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

  // Handles safe framework lifecycle updates with proper cleanup hooks
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
          {/* Global Header Bar */}
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

          {/* Main Context Portal */}
          <main className="flex-1 space-y-6 p-6 max-w-[1600px] w-full mx-auto transition-opacity duration-200">
            {/* System Status Notifications */}
            {!HAS_NASA_KEY && <KeyMissingAlert />}
            {error && <TelemetryFailureAlert message={error} />}

            {/* Dashboard Workspace Views */}
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/* ==========================================================================
   MODULAR SUB-COMPONENTS & SUB-VIEWS (CLEAN ARTIFACT SEPARATION)
   ========================================================================== */

interface MetricsPanelProps {
  result: AnalysisResult | null;
  datasetLabel: string;
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

// 1. Overview Tab Layout
function OverviewTab({ result, datasetLabel, anomalies, loading }: MetricsPanelProps & { anomalies: DataPoint[], loading: boolean }) {
  return (
    <div className="space-y-6">
      <GlobalMetricsPanel result={result} datasetLabel={datasetLabel} />
      
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border-border/40 bg-card/40 backdrop-blur xl:col-span-2">
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

// 2. Ingestion Operations Tab Layout
interface IngestionTabProps extends MetricsPanelProps {
  dataset: DatasetId;
  loading: boolean;
  onDatasetChange: (v: DatasetId) => void;
  onForceReload: () => void;
}

function IngestionTab({ dataset, result, datasetLabel, loading, onDatasetChange, onForceReload }: IngestionTabProps) {
  return (
    <div className="space-y-6">
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

// 3. Isolated Anomalies Analysis Tab Layout
function AnomaliesTab({ result, datasetLabel, anomalies }: MetricsPanelProps & { anomalies: DataPoint[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card/20 backdrop-blur">
        <DataTable points={anomalies} datasetLabel={`${datasetLabel} (Filtered Anomalies)`} />
      </div>
    </div>
  );
}

// 4. Infrastructure/Config Settings View Layout
function SettingsTab() {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-base font-semibold">System Configuration Matrix</CardTitle>
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

/* Static Alerts */
function KeyMissingAlert() {
  return (
    <Alert className="border-warning/30 bg-warning/5 text-warning-foreground">
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
    <Alert variant="destructive" className="bg-destructive/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold tracking-tight">System Fetch Interface Terminated</AlertTitle>
      <AlertDescription className="text-xs font-mono mt-1 opacity-90">{message}</AlertDescription>
    </Alert>
  );
}
