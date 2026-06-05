import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive";
}

// Re-mapped to clean, soft background colors for the right panel accents
const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  primary: "text-sky-600 bg-sky-50",
  success: "text-emerald-600 bg-emerald-50",
  warning: "text-amber-600 bg-amber-50",
  destructive: "text-red-600 bg-red-50",
};

export function KpiCard({ label, value, hint, icon: Icon, tone = "primary" }: Props) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
      <CardContent className="flex flex-col justify-between p-6 min-h-[140px]">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="min-w-0 space-y-1.5">
            {/* Swapped uppercase tracking-wider with approachable sentence case */}
            <p className="text-xs font-medium text-slate-500 capitalize">
              {label}
            </p>
            <p className="truncate text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {value}
            </p>
          </div>
          
          {/* Softer, fully rounded panel badge structures */}
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors", toneClass[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Clean separation rule line breaking out the lower telemetry indicators */}
        {hint && (
          <div className="mt-4 pt-3 border-t border-slate-100 w-full">
            <p className="text-[11px] font-normal text-slate-400 truncate">
              {hint}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
