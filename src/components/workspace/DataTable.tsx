import * as React from "react";
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
    <Card className="border-border bg-card shadow-sm overflow-hidden rounded-[var(--radius)]">
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Telemetry record stream
          </CardTitle>
          <p className="text-xs text-muted-foreground font-normal mt-0.5">
            Displaying {visible.length} of {points.length} matching entries
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={points.length === 0}
          className="h-9 px-4 rounded-[var(--radius)] border-border text-foreground font-medium text-xs bg-card hover:bg-muted transition-colors cursor-pointer shadow-none inline-flex items-center disabled:opacity-40"
        >
          <Download className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
          Export dataset
        </Button>
      </CardHeader>

      <CardContent className="p-0 border-t border-border">
        <div className="max-h-[440px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10 border-b border-border">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="h-10 text-xs font-semibold text-muted-foreground pl-6">
                  Label
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-muted-foreground text-right">
                  Metric score
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-muted-foreground">
                  Timestamp
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold text-muted-foreground pr-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                    No logs available yet. Process a dataset source above to load incoming entries.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-b border-border hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="max-w-[280px] truncate font-medium text-foreground py-3.5 pl-6 text-sm">
                      {p.label}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-3.5">{p.category}</TableCell>
                    <TableCell className="text-right tabular-nums text-foreground font-medium py-3.5 text-sm">
                      {p.value.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-3.5">{p.timestamp}</TableCell>
                    <TableCell className="py-3.5 pr-6">
                      {p.anomaly ? (
                        <Badge
                          variant="outline"
                          className="font-medium text-[11px] rounded-[var(--radius)] bg-destructive/10 text-destructive border-destructive/20 px-2.5 py-0.5"
                        >
                          Anomaly flag
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="font-medium text-[11px] rounded-[var(--radius)] bg-muted text-muted-foreground border-border px-2.5 py-0.5"
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
