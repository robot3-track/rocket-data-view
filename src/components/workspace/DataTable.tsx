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
import { toCSV, type DataPoint } from "../../services/nasa"; // Adjusted relative path to your service layer

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
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div>
          <CardTitle className="text-base">Raw Records</CardTitle>
          <p className="text-xs text-muted-foreground">
            Showing {visible.length} of {points.length} records
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={points.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[420px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No data yet — run an analysis to populate this table.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[280px] truncate font-medium">{p.label}</TableCell>
                    <TableCell className="text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.value.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{p.timestamp}</TableCell>
                    <TableCell>
                      {p.anomaly ? (
                        <Badge variant="destructive">Anomaly</Badge>
                      ) : (
                        <Badge variant="secondary">Nominal</Badge>
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
