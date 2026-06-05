import { useState, useEffect } from "react";
// FIXED: Fixed path mapping aliases to direct relative paths and corrected file casing
import { DataTable } from "../components/workspace/DataTable";
import { DataChart } from "../DataChart"; 

// FIXED: Imported fetchDataset to match your verified services/nasa.ts architecture exports
import { fetchDataset, type DataPoint } from "../../services/nasa";

export default function WorkspacePage() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [chartSeries, setChartSeries] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // FIXED: Invokes fetchDataset with "neo" to fetch and format live asteroid arrays safely
    fetchDataset("neo")
      .then((result) => {
        setDataPoints(result.points);
        setChartSeries(result.series); // Pulls the clean date-mapped timeline directly
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard page failed to fetch records:", err);
        setError(err.message || "Failed to parse NASA feed");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-sm text-muted-foreground animate-pulse">Syncing live space tracking telemetry...</div>;
  if (error) return <div className="p-10 text-sm text-destructive">Error linking live code: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      {/* FIXED: Uses the pre-mapped series data for optimized area chart plotting */}
      <DataChart data={chartSeries} />
      <DataTable points={dataPoints} datasetLabel="Live Asteroids" />
    </div>
  );
}
