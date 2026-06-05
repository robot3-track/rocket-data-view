import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Database, HeartPulse, Sun } from "lucide-react";
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
} from "@/services/nasa";

type Tab = "overview" | "ingestion" | "anomalies" | "settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dataset, setDataset] = useState<DatasetId>("neo");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (id: DatasetId) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchDataset(id);
      setResult(r);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Failed to fetch NASA data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis("neo");
  }, []);

  const datasetLabel = useMemo(
    () => DATASETS.find((d) => d.id === (result?.dataset ?? dataset))?.label ?? "Dataset",
    [result, dataset],
  );

  const anomalies = result?.points.filter((p) => p.anomaly) ?? [];

  return (
    <SidebarProvider>
      <Toaster />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar activeTab={tab} onSelect={setTab} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-sm font-semibold capitalize">
                  {tab === "ingestion" ? "NASA API Ingestion" : tab}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {result ? `Last sync ${new Date(result.fetchedAt).toLocaleString()}` : "Awaiting data…"}
                </p>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {HAS_NASA_KEY ? "Live key" : "DEMO_KEY"}
              </Badge>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-4 sm:p-6">
            {!HAS_NASA_KEY && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>NASA API key not configured</AlertTitle>
                <AlertDescription>
                  Set <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_NASA_API_KEY</code> in
                  your environment (locally in <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>{" "}
                  or in Vercel project settings) to use a personal key. Falling back to NASA's shared{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">DEMO_KEY</code> with strict rate
                  limits.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {(tab === "overview" || tab === "ingestion" || tab === "anomalies") && (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label="Active Anomalies"
                    value={result?.kpis.activeAnomalies ?? "N/A"}
                    hint="Flagged in current dataset"
                    icon={AlertTriangle}
                    tone="destructive"
                  />
                  <KpiCard
                    label="Total Data Points"
                    value={result ? result.kpis.totalDataPoints.toLocaleString() : "N/A"}
                    hint={datasetLabel}
                    icon={Database}
                    tone="primary"
                  />
                  <KpiCard
                    label="System Health"
                    value={result ? `${result.kpis.systemHealth}%` : "N/A"}
                    hint="Composite signal score"
                    icon={HeartPulse}
                    tone="success"
                  />
                  <KpiCard
                    label="Solar Activity"
                    value={result?.kpis.solarActivity ?? "N/A"}
                    hint="Current heliophysics state"
                    icon={Sun}
                    tone="warning"
                  />
                </section>

                {(tab === "overview" || tab === "ingestion") && (
                  <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <Card className="border-border/60 bg-card/80 xl:col-span-2">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Telemetry — {datasetLabel}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Interactive time-series for the active dataset
                            </p>
                          </div>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <DataChart data={result?.series ?? []} />
                      </CardContent>
                    </Card>
                    <div className="space-y-4">
                      <IngestionPanel
                        dataset={dataset}
                        onDatasetChange={(v) => {
                          setDataset(v);
                          runAnalysis(v);
                        }}
                        onAnalyze={() => runAnalysis(dataset)}
                        loading={loading}
                      />
                      <Card className="border-border/60 bg-card/80">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Recent Anomalies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {anomalies.slice(0, 5).map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center justify-between rounded-md border border-border/50 bg-background/40 px-3 py-2 text-xs"
                            >
                              <span className="truncate pr-2">{a.label}</span>
                              <Badge variant="destructive" className="shrink-0">
                                {a.category}
                              </Badge>
                            </div>
                          ))}
                          {anomalies.length === 0 && (
                            <p className="text-xs text-muted-foreground">No anomalies detected.</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                )}

                <section>
                  <DataTable points={result?.points ?? []} datasetLabel={datasetLabel} />
                </section>
              </>
            )}

            {tab === "settings" && (
              <Card className="border-border/60 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-base">Environment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">NASA API Key</span>
                    <Badge variant={HAS_NASA_KEY ? "default" : "secondary"}>
                      {HAS_NASA_KEY ? "Configured" : "Using DEMO_KEY"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Configure <code className="rounded bg-muted px-1 py-0.5">VITE_NASA_API_KEY</code> in
                    your Vercel project's Environment Variables, then redeploy.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}