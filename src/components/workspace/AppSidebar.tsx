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
  // FIXED: Expanded runtime string literal definition to include the documentation view token
  activeTab: "overview" | "ingestion" | "anomalies" | "settings" | "documentation";
  onSelect: (tab: Props["activeTab"]) => void;
}

// FIXED: Appended the operational manual routing metadata object directly into the map array
const NAV = [
  { id: "overview", label: "Overview", icon: LineChart },
  { id: "ingestion", label: "NASA API Ingestion", icon: Database },
  { id: "anomalies", label: "Anomalies", icon: Activity },
  { id: "documentation", label: "Operations Manual", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({ activeTab, onSelect }: Props) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
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
      <SidebarContent>
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
        <SidebarGroup>
          <SidebarGroupLabel>Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-[color:var(--success)] animate-pulse" />
                <span>Telemetry online</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
