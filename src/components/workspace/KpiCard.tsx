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

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  primary: "text-primary bg-primary/10",
  success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
  warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
  destructive: "text-destructive bg-destructive/10",
};

export function KpiCard({ label, value, hint, icon: Icon, tone = "primary" }: Props) {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-3xl font-semibold tabular-nums text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", toneClass[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
