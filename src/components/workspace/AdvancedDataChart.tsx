import * as React from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface AdvancedDataChartProps {
  streams: Array<{
    id: string;
    source: string;
    metric: string;
    deviation: number;
    timestamp: string;
  }>;
}

export function AdvancedDataChart({ streams }: AdvancedDataChartProps) {
  if (!streams || streams.length === 0) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center text-xs text-muted-foreground border border-border bg-card">
        Awaiting active telemetry streams...
      </div>
    );
  }

  // 1. Map true historical values
  const historical = streams
    .map((s, index) => {
      const match = s.metric.match(/\d+/);
      const windSpeed = match ? parseInt(match[0], 10) : Math.round(450 + s.deviation * 80);
      const geoIndex = parseFloat((Math.abs(s.deviation) * 1.8 + 1.5).toFixed(1));
      return {
        time: s.timestamp ? s.timestamp.split(" ")[0] : `T-${index}`,
        windHist: windSpeed,
        geoHist: geoIndex,
        windPred: null,
        geoPred: null,
      };
    })
    .reverse();

  // 2. Generate future regression intervals
  const len = historical.length;
  const combinedDataset = [...historical];

  if (len > 0) {
    const lastPoint = historical[len - 1];

    // Extrapolate trend deltas
    let deltaWind = 18;
    let deltaGeo = -0.3;
    if (len > 1) {
      deltaWind = Math.round((historical[len - 1].windHist! - historical[0].windHist!) / len);
      deltaGeo = parseFloat(
        ((historical[len - 1].geoHist! - historical[0].geoHist!) / len).toFixed(2),
      );
    }

    // Anchor point connection (where history ends and prediction begins)
    combinedDataset[len - 1] = {
      ...lastPoint,
      windPred: lastPoint.windHist,
      geoPred: lastPoint.geoHist,
    };

    // Append future milestones with predictive values
    const intervals = ["+10m Forecast", "+20m Forecast", "+30m Forecast"];
    intervals.forEach((label, i) => {
      const step = i + 1;
      combinedDataset.push({
        time: label,
        windHist: null,
        geoHist: null,
        windPred: Math.max(200, Math.round(lastPoint.windHist! + deltaWind * step)),
        geoPred: Math.max(0, parseFloat((lastPoint.geoHist! + deltaGeo * step).toFixed(1))),
      });
    });
  }

  return (
    <div className="w-full h-[320px] bg-card p-2 border border-border">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedDataset} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
          {/* Grid lines set to your neutral structural border token */}
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          
          <XAxis 
            dataKey="time" 
            stroke="var(--color-muted-foreground)" 
            fontSize={10} 
            tickLine={false} 
          />
          <YAxis
            yAxisId="left"
            stroke="var(--color-chart-1)"
            fontSize={10}
            tickLine={false}
            domain={["dataMin - 50", "dataMax + 50"]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="var(--color-chart-3)"
            fontSize={10}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
              fontSize: "11px",
            }}
            formatter={(value, name) => {
              if (name.toString().includes("Hist"))
                return [value, name.toString().replace("Hist", " (Actual)")];
              return [value, name.toString().replace("Pred", " (Forecasted)")];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "var(--color-foreground)" }} />

          {/* Historical Series Lines (Solid) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="windHist"
            name="Solar Wind Speed"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="geoHist"
            name="Geomagnetic Index"
            stroke="var(--color-chart-3)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />

          {/* Predictive Model Lines (Dashed) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="windPred"
            name="Predicted Wind Speed"
            stroke="var(--color-chart-1)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 2, fill: "var(--color-chart-1)" }}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="geoPred"
            name="Predicted Kp Index"
            stroke="var(--color-chart-3)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 2, fill: "var(--color-chart-3)" }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
