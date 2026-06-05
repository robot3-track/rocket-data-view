import { AdvancedDataChart } from "./AdvancedDataChart";
import { useState, useEffect } from "react";
import { Activity, ShieldAlert, Zap, Orbit, RefreshCw, BarChart2 } from "lucide-react";
import { fetchSpaceWeatherCorrelation, type TelemetryStream, type CorrelationMetrics } from "@/services/spaceWeatherCorrelation";

export function CorrelatedView() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [streams, setStreams] = useState<TelemetryStream[]>([]);
  const [metrics, setMetrics] = useState<CorrelationMetrics>({
    correlativeIndex: 0,
    cascadeProbability: 0,
    systemFlag: "Initializing array hooks..."
  });

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchSpaceWeatherCorrelation();
      setStreams(data.streams);
      setMetrics(data.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    triggerSync();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upper Action Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Orbit className="h-4 w-4 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} /> 
            Live NASA Deep-Space Core Pipeline
          </h3>
          <p className="text-xs text-slate-400">
            Evaluating active correlation variables between solar wind velocity indices and orbital sensor anomalies.
          </p>
        </div>
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing NASA Feeds..." : "Query Live Sensors"}
        </button>
      </div>

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream Table Module */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          {/* Multi-source Overlay Data Matrix Trend Line */}
          <div className="pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">Multi-Axis Correlation Matrix Timeline</span>
            <AdvancedDataChart streams={streams} />
          </div>
          <hr className="border-slate-100 my-4" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Active Deviation Vectors
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-md font-mono">
              Live DONKI Stream
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-medium">
                  <th className="p-3">Stream ID</th>
                  <th className="p-3">Data Source</th>
                  <th className="p-3">Evaluated Metric</th>
                  <th className="p-3 text-right">Sigma Deviation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {streams.map((stream) => (
                  <tr key={stream.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-700">{stream.id}</td>
                    <td className="p-3 font-medium text-slate-900">{stream.source}</td>
                    <td className="p-3 text-slate-500">{stream.metric}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        stream.status === "critical" ? "bg-rose-50 text-rose-600" :
                        stream.status === "warning" ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>
                        {stream.deviation > 0 ? `+${stream.deviation}` : stream.deviation} σ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytical Forecast Panel */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-sky-500" /> Dynamic Analysis Map
            </span>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500" /> Correlative Index</span>
                  <span className="font-mono font-bold text-slate-900">{metrics.correlativeIndex}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${metrics.correlativeIndex * 100}%` }} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Cascade Probability</span>
                  <span className="font-mono font-bold text-slate-900">{metrics.cascadeProbability}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${metrics.cascadeProbability}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-100/50 text-[11px] text-sky-700 leading-relaxed transition-all">
            <strong>System Status:</strong> {metrics.systemFlag}
          </div>
        </div>

      </div>
    </div>
  );
}
