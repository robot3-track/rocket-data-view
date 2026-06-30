import * as React from "react";
import { Activity, Database, LineChart, Radio, Satellite, Settings, BookOpen } from "lucide-react";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";

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
  const { open } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="fixed inset-y-0 left-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-50 transition-all duration-300 ease-in-out"
    >
      {/* Stationary Layout Header Container */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3 bg-sidebar shrink-0 min-h-[69px]">
        <div className="flex h-9 w-9 items-center justify-center bg-muted text-sidebar-foreground border border-sidebar-border shrink-0">
          <Satellite className="h-5 w-5" />
        </div>
        {open && (
          <div className="min-w-0 transition-opacity duration-200">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">NASA Analytics</p>
            <p className="truncate text-xs text-muted-foreground">Mission Workspace</p>
          </div>
        )}
      </div>

      {/* Navigation Registry Tree */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {open && (
            <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2 transition-opacity duration-200">
              Workspace
            </span>
          )}
          <div className="space-y-1">
            {NAV.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  title={!open ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent border border-transparent"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-sidebar-accent-foreground" : "text-muted-foreground"}`}
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

      {/* Fixed Operational Status Block */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar shrink-0 min-h-[65px]">
        {open && (
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2 transition-opacity duration-200">
            Status
          </span>
        )}
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-success animate-pulse shrink-0" />
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
