import { Activity, Database, LineChart, Radio, Satellite, Settings, BookOpen } from "lucide-react";
import {
  Sidebar,
  useSidebar, // 💡 Added hook to read state dynamically
} from "@/components/ui/sidebar";

interface Props {
  activeTab: "overview" | "ingestion" | "anomalies" | "settings" | "documentation" | "correlation";
  onSelect: (tab: Props["activeTab"]) => void;
}

const NAV = [
  { id: "overview", label: "Overview", icon: LineChart },
  { id: "ingestion", label: "NASA API Ingestion", icon: Database },
  { id: "correlation", label: "Advanced Correlation", icon: Activity },
  { id: "anomalies", label: "Anomalies", icon: Activity },
  { id: "documentation", label: "Operations Manual", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({ activeTab, onSelect }: Props) {
  // Grab the current open state from shadcn's context provider
  const { open } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="fixed inset-y-0 left-0 h-screen bg-[#0b1329] text-slate-200 flex flex-col border-r border-slate-800/60 z-50 transition-all duration-300 ease-in-out"
    >
      {/* Strictly Stationary Logo Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-[#0b1329] shrink-0 min-h-[69px]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
          <Satellite className="h-5 w-5" />
        </div>
        {/* Hide text layers cleanly when sidebar goes into collapsed icon state */}
        {open && (
          <div className="min-w-0 transition-opacity duration-200">
            <p className="truncate text-sm font-semibold text-slate-100">NASA Analytics</p>
            <p className="truncate text-xs text-slate-400">Mission Workspace</p>
          </div>
        )}
      </div>

      {/* Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {open && (
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 transition-opacity duration-200">
              Workspace
            </span>
          )}
          <div className="space-y-1">
            {NAV.map((item) => {
              const IsActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  title={!open ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    IsActive
                      ? "bg-sky-500/15 text-sky-400 border border-sky-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${IsActive ? "text-sky-400" : "text-slate-400"}`}
                  />
                  {open && (
                    <span className="truncate transition-opacity duration-200">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Status Footer Area */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0b1329] shrink-0 min-h-[65px]">
        {open && (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 transition-opacity duration-200">
            Status
          </span>
        )}
        <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
          <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse shrink-0" />
          {open && (
            <span className="font-medium truncate transition-opacity duration-200">
              Telemetry online
            </span>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
