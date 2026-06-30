import * as React from "react";
import { ComponentType } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "destructive" | "warning";
  className?: string;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  className = "",
}: KpiCardProps) {
  // Bind card tones directly to custom design tokens to keep things light-mode native
  const toneStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <div className={`p-6 bg-card border border-border shadow-sm rounded-[var(--radius)] flex flex-col justify-between relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between w-full gap-2">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block truncate">
            {label}
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground block truncate">
            {value}
          </span>
        </div>

        {Icon && (
          <div className={`p-2.5 border rounded-[var(--radius)] shrink-0 ${toneStyles[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {hint && (
        <p className="text-[11px] text-muted-foreground mt-3 border-t border-border pt-2 truncate w-full">
          {hint}
        </p>
      )}
    </div>
  );
}
