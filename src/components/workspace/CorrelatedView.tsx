import { useEffect, useState } from "react";
import { Activity, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedDataChart, type CombinedDataPoint } from "./AdvancedDataChart";
import { fetchCorrelatedSpaceWeather } from "@/services/spaceWeatherCorrelation";

export function CorrelatedView() {
  const [data, setData] = useState<CombinedDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCorrelationFeed() {
      try {
        setLoading(true);
        // Request a historical 30-day window to pull rich, intersecting pattern variations
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);

        const isoStart = start.toISOString().split("T")[0];
        const isoEnd = end.toISOString().split("T")[0];

        const correlatedFeed = await fetchCorrelatedSpaceWeather(isoStart, isoEnd);
        setData(correlatedFeed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to sync correlative indicators.");
      } finally {
        setLoading(false);
      }
    }
    loadCorrelationFeed();
  }, []);

  // Compute live analytical summary highlights from the data array
  const peakVelocity = data.length ? Math.max(...data.map(d => d.solarVelocity)) : 0;
  const peakStormIndex = data.length ? Math.max(...data.map(d => d.geomagneticIndex)) : 0;
  const currentInsight = data.find(d => d.geomagneticIndex === peakStormIndex)?.insight;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        <p className="text-sm text-slate-500 font-medium">Blending separate data structures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border border-red-100 rounded-2xl bg-red-50/50 max-w-md mx-auto">
        <p className="text-sm font-semibold text-red-900">Analysis Pipeline Standby</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Editorial Overview Section explaining the multi-axis view */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-600" /> Cross-Endpoint Correlation Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overlaying live deep-space solar wind velocities against earthly geomagnetic perturbations.
          </p>
        </div>
      </div>

      {/* Advanced Chart Display Component Card */}
      <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">Interactive Time-Series Alignment</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Compare peak execution delays by tracking points across the left ($Y_1$) and right ($Y_2$) operational parameters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedDataChart data={data} />
        </CardContent>
      </Card>

      {/* Insight Bar summarizing the mathematical patterns discovered */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-200/80 bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Peak Plasma Speed</span>
            <span className="text-lg font-bold text-slate-900">{peakVelocity} km/s</span>
          </div>
        </Card>

        <Card className="border-slate-200/80 bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Peak Disturbance Index</span>
            <span className="text-lg font-bold text-slate-900">{peakStormIndex} Kp</span>
          </div>
        </Card>

        <Card className="border-slate-200/80 bg-white rounded-2xl p-5 shadow-sm md:col-span-1 flex flex-col justify-center bg-slate-50/50 border-dashed">
          <span className="text-xs font-semibold text-slate-900 block mb-0.5">💡 Automation Summary</span>
          <p className="text-[11px] leading-relaxed text-slate-500 font-normal">
            {currentInsight || "No critical planetary satellite operational impact metrics detected within this cycle."}
          </p>
        </Card>
      </div>
    </div>
  );
}
