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
    <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-3 pt-6 px-6">
        <CardTitle className="text-base font-semibold tracking-tight text-slate-900">
          NASA data pipeline source
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-4 p-6 pt-0 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          {/* Swapped aggressive uppercase for approachable sentence case label layout */}
          <label className="text-xs font-medium text-slate-500 block">
            Select target dataset
          </label>
          <Select value={dataset} onValueChange={(v) => onDatasetChange(v as DatasetId)}>
            <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-slate-800 rounded-xl h-10 px-3 hover:bg-slate-50 transition-colors cursor-pointer focus:ring-1 focus:ring-sky-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200/80 rounded-xl shadow-lg">
              {DATASETS.map((d) => (
                <SelectItem key={d.id} value={d.id} className="text-sm text-slate-700 focus:bg-slate-50 focus:text-slate-900 rounded-lg py-2 cursor-pointer">
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {meta && <p className="text-xs leading-relaxed text-slate-400 mt-1">{meta.description}</p>}
        </div>

        {/* Re-styled action button to look like a clean, premium enterprise trigger instead of a system shell input */}
        <Button 
          onClick={onAnalyze} 
          disabled={loading} 
          className="h-10 px-5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shrink-0 inline-flex items-center justify-center cursor-pointer"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <Play className="mr-2 h-3.5 w-3.5 fill-current" />
          )}
          {loading ? "Analyzing streams..." : "Process dataset"}
        </Button>
      </CardContent>
    </Card>
  );
}
