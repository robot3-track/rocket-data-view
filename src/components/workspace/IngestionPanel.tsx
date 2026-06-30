import * as React from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATASETS, type DatasetId } from "@/services/nasa";

interface Props {
  dataset: DatasetId;
  onDatasetChange: (v: DatasetId) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export function IngestionPanel({ dataset, onDatasetChange, onAnalyze, loading }: Props) {
  const meta = DATASETS.find((d) => d.id === dataset);
  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden h-full rounded-[var(--radius)]">
      <CardHeader className="pb-3 pt-6 px-6">
        <CardTitle className="text-base font-semibold tracking-tight text-foreground">
          NASA data pipeline source
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col justify-between p-6 pt-0 gap-5 h-[calc(100%-60px)]">
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground block">Select target dataset</label>
          <Select value={dataset} onValueChange={(v) => onDatasetChange(v as DatasetId)}>
            <SelectTrigger className="w-full bg-muted border-border text-foreground rounded-[var(--radius)] h-10 px-3 hover:opacity-90 transition-opacity cursor-pointer focus:ring-1 focus:ring-ring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border shadow-lg rounded-[var(--radius)]">
              {DATASETS.map((d) => (
                <SelectItem
                  key={d.id}
                  value={d.id}
                  className="text-sm text-popover-foreground focus:bg-muted focus:text-foreground rounded-[var(--radius)] py-2 cursor-pointer"
                >
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {meta && (
            <p className="text-xs leading-relaxed text-muted-foreground mt-1.5">{meta.description}</p>
          )}
        </div>

        <Button
          onClick={onAnalyze}
          disabled={loading}
          className="w-full h-11 bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-sm rounded-[var(--radius)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer mt-auto"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground/70" />
          ) : (
            <Play className="mr-2 h-3.5 w-3.5 fill-current text-primary-foreground" />
          )}
          {loading ? "Analyzing streams..." : "Process dataset"}
        </Button>
      </CardContent>
    </Card>
  );
}
