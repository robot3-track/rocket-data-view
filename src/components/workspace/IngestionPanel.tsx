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
    <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-3 pt-6 px-6">
        <CardTitle className="text-base font-semibold tracking-tight text-slate-900">
          NASA data pipeline source
        </CardTitle>
      </CardHeader>

      {/* Changed container to a stacked flex layout to allow text descriptions and controls to breathe naturally */}
      <CardContent className="flex flex-col justify-between p-6 pt-0 gap-5 h-[calc(100%-60px)]">
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-500 block">Select target dataset</label>
          <Select value={dataset} onValueChange={(v) => onDatasetChange(v as DatasetId)}>
            <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-slate-800 rounded-xl h-10 px-3 hover:bg-slate-50 transition-colors cursor-pointer focus:ring-1 focus:ring-sky-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200/80 rounded-xl shadow-lg">
              {DATASETS.map((d) => (
                <SelectItem
                  key={d.id}
                  value={d.id}
                  className="text-sm text-slate-700 focus:bg-slate-50 focus:text-slate-900 rounded-lg py-2 cursor-pointer"
                >
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {meta && (
            <p className="text-xs leading-relaxed text-slate-400 mt-1.5">{meta.description}</p>
          )}
        </div>

        {/* Removed horizontal squeezing constraints; the action button now spans full-width at the bottom of the card block safely */}
        <Button
          onClick={onAnalyze}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer mt-auto"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <Play className="mr-2 h-3.5 w-3.5 fill-current text-white/90" />
          )}
          {loading ? "Analyzing streams..." : "Process dataset"}
        </Button>
      </CardContent>
    </Card>
  );
}
