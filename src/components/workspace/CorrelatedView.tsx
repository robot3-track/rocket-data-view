import { useState, useEffect } from "react";
import { Activity, ShieldAlert, Zap, Orbit, RefreshCw, BarChart2 } from "lucide-react";

interface TelemetryStream {
  id: string;
  source: string;
  metric: string;
  deviation: number;
  status: "critical" | "warning" | "stable";
  timestamp: string;
}

export function CorrelatedView() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [streams, setStreams] = useState<TelemetryStream[]>([]);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setStreams([
        { id: "STR-104", source: "SOHO Satellite", metric: "Proton Flux Density", deviation: +4.2, status: "critical", timestamp: "15:28:12" },
        { id: "STR-209", source: "Deep Space Network", metric: "X-ray Background", deviation: +2.8, status: "warning", timestamp: "15:27:45" },
        { id: "STR-881", source: "Mars Atmosphere Node", metric: "Ionization Rate", deviation: +0.3, status: "stable", timestamp: "15:26:01" },
        { id: "STR-412", source: "Goldstone Array", metric: "Signal Attenuation", deviation: +1.9, status: "warning", timestamp: "15:24:19" },
      ]);
      setIsSyncing(false);
    }, 1100);
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
            Cross-Sensor Telemetry Engine
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
          {isSyncing ? "Syncing Sensors..." : "Recalibrate Array"}
        </button>
      </div>

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream Table Module */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Active Deviation Vectors
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-md font-mono">
              Live Feed
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
              <BarChart2 className="h-4 w-4 text-sky-500" /> Mathematical Summary
            </span>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500" /> Correlative Index</span>
                  <span className="font-mono font-bold text-slate-900">0.842</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-amber-500 w-[84%]" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Cascade Probability</span>
                  <span className="font-mono font-bold text-slate-900">14.6%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-rose-500 w-[14.6%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-100/50 text-[11px] text-sky-700 leading-relaxed">
            <strong>System Flag:</strong> Overlap anomalies confirmed between SOHO Flux and Deep Space X-ray backgrounds. Secondary verification cycles are running automatically.
          </div>
        </div>

      </div>
    </div>
  );
}
