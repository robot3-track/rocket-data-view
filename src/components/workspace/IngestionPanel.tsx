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
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">NASA API Ingestion</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dataset
          </label>
          <Select value={dataset} onValueChange={(v) => onDatasetChange(v as DatasetId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATASETS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {meta && <p className="text-xs text-muted-foreground">{meta.description}</p>}
        </div>
        <Button onClick={onAnalyze} disabled={loading} className="sm:w-auto">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {loading ? "Analyzing…" : "Analyze Data"}
        </Button>
      </CardContent>
    </Card>
  );
}
