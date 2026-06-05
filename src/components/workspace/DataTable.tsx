import { useState, useEffect } from "react";
import { DataTable } from "@/components/datatable";
import { DataChart } from "@/components/datachart";
import { fetchNasaAsteroidData, type DataPoint } from "@/services/nasa";

export default function WorkspacePage() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Invokes your live cosmic telemetry data pipeline
    fetchNasaAsteroidData()
      .then((liveRecords) => {
        setDataPoints(liveRecords);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard page failed to fetch records:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10">Fetching live space telemetry...</div>;

  return (
    <div className="space-y-6 p-6">
      <DataChart data={dataPoints.map(p => ({ date: p.timestamp, value: p.value }))} />
      <DataTable points={dataPoints} datasetLabel="Live Asteroids" />
    </div>
  );
}
