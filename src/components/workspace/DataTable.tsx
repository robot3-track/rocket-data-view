import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toCSV, type DataPoint } from "../../services/nasa";

interface Props {
  points: DataPoint[];
  datasetLabel: string;
}

export function DataTable({ points, datasetLabel }: Props) {
  const visible = points.slice(0, 50);

  const handleDownload = () => {
    const blob = new Blob([toCSV(points)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nasa-${datasetLabel.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-slate-200/80 bg-white rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
        <div>
          {/* Shifted text formats to match clean, warm editorial standards */}
          <CardTitle className="text-base font-semibold tracking-tight text-slate-900">
            Telemetry record stream
          </CardTitle>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Displaying {visible.length} of {points.length} matching entries
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={points.length === 0}
          className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 font-medium text-xs bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-none inline-flex items-center disabled:opacity-40"
        >
          <Download className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Export dataset
        </Button>
      </CardHeader>

      <CardContent className="p-0 border-t border-slate-100">
        <div className="max-h-[440px] overflow-auto">
          <Table>
            {/* Sticky headers configured with premium, clean light accents */}
            <TableHeader className="sticky top-0 bg-slate-50/70 backdrop-blur z-10 border-b border-slate-100">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="h-10 text-xs font-semibold text-slate-500 pl-6">
                  Label
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-slate-500">
                  Category
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-slate-500 text-right">
                  Metric score
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-slate-500">
                  Timestamp
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-slate-500 pr-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    No logs available yet. Process a dataset source above to load incoming entries.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                  >
                    <TableCell className="max-w-[280px] truncate font-medium text-slate-800 py-3.5 pl-6 text-sm">
                      {p.label}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs py-3.5">{p.category}</TableCell>
                    <TableCell className="text-right tabular-nums text-slate-900 font-medium py-3.5 text-sm">
                      {p.value.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs py-3.5">{p.timestamp}</TableCell>
                    <TableCell className="py-3.5 pr-6">
                      {/* Human-centric rounded badges substituting clinical console flags */}
                      {p.anomaly ? (
                        <Badge
                          variant="outline"
                          className="font-medium text-[11px] rounded-full bg-red-50 text-red-700 border-red-200/40 px-2.5 py-0.5"
                        >
                          Anomaly flag
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="font-medium text-[11px] rounded-full bg-slate-50 text-slate-600 border-slate-200/50 px-2.5 py-0.5"
                        >
                          Nominal
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
