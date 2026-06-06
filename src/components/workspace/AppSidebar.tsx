import { Activity, Database, LineChart, Radio, Satellite, Settings, BookOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  return (
    <Sidebar 
      collapsible="icon" 
      className="h-screen sticky top-0 flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar"
    >
      {/* Absolute Rigid Top Header Logo Container */}
      <SidebarHeader className="absolute top-0 left-0 right-0 border-b border-sidebar-border bg-sidebar z-30 h-[57px] flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-1 w-full">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Satellite className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">NASA Analytics</p>
            <p className="truncate text-xs text-muted-foreground">Mission Workspace</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Scrollable Core — with a 57px offset spacing buffer at the top to clear the sticky header */}
      <SidebarContent className="flex-1 overflow-y-auto pt-[57px] pb-[70px] min-h-0 custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => onSelect(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Absolute Rigid Bottom Footer Status Container */}
      <div className="absolute bottom-0 left-0 right-0 h-[70px] border-t border-sidebar-border bg-sidebar z-30 px-4 flex flex-col justify-center">
        <SidebarGroupLabel className="px-0 mb-0.5">Status</SidebarGroupLabel>
        <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-600">Telemetry online</span>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
