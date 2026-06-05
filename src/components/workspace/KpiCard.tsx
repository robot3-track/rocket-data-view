import { ReactNode, ComponentType } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "destructive" | "warning";
  className?: string; // Clear TypeScript property restriction errors
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  className = ""
}: KpiCardProps) {
  // Map tones to clean, professional background color accents for your icons
  const toneStyles = {
    primary: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    destructive: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
  };

  return (
    <div 
      className={`flex flex-col justify-between relative overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between w-full gap-2">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-medium tracking-tight text-slate-400 uppercase block truncate">
            {label}
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900 block truncate">
            {value}
          </span>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${toneStyles[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {hint && (
        <p className="text-[11px] text-slate-400 mt-3 border-t border-slate-100 pt-2 truncate w-full">
          {hint}
        </p>
      )}
    </div>
  );
}
