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
      {/* Strictly Static Non-Scrolling Header */}
      <SidebarHeader className="border-b border-sidebar-border shrink-0 bg-sidebar z-10">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Satellite className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">NASA Analytics</p>
            <p className="truncate text-xs text-muted-foreground">Mission Workspace</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Independently Scrollable Navigation Body */}
      <SidebarContent className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
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

      {/* Strictly Static Bottom Footer Slot */}
      <div className="p-4 border-t border-sidebar-border shrink-0 bg-sidebar mt-auto">
        <SidebarGroupLabel className="px-0 mb-1">Status</SidebarGroupLabel>
        <div className="py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-600">Telemetry online</span>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
