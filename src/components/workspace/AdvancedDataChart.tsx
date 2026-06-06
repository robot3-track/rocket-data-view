import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from "recharts";

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
  // 1. Parse historical data streams
  const historicalData = streams.map((s, index) => {
    const match = s.metric.match(/\d+/);
    const windSpeed = match ? parseInt(match[0], 10) : 400 + (s.deviation * 100);
    const geomagneticIndex = parseFloat((Math.abs(s.deviation) * 2.1 + 1.2).toFixed(1));

    return {
      time: s.timestamp ? s.timestamp.split(' ')[0] : `T-${index}`,
      "Solar Wind Speed (km/s)": windSpeed,
      "Geomagnetic Index (Kp)": geomagneticIndex,
      isPrediction: false,
    };
  }).reverse();

  // 2. Generate predictive trend projections (Simple Linear Regression slopes)
  const len = historicalData.length;
  let predictedData: any[] = [];
  
  if (len > 1) {
    const lastPoint = historicalData[len - 1];
    let avgWindDelta = 0;
    let avgGeoDelta = 0;

    // Calculate baseline rate of change over past points
    for (let i = 1; i < len; i++) {
      avgWindDelta += historicalData[i]["Solar Wind Speed (km/s)"] - historicalData[i-1]["Solar Wind Speed (km/s)"];
      avgGeoDelta += historicalData[i]["Geomagnetic Index (Kp)"] - historicalData[i-1]["Geomagnetic Index (Kp)"];
    }
    avgWindDelta /= (len - 1);
    avgGeoDelta /= (len - 1);

    // Build future prediction milestones (+10m, +20m, +30m forecast windows)
    predictedData = [
      {
        ...lastPoint,
        time: lastPoint.time + " (Now)",
        "Predicted Wind Speed": lastPoint["Solar Wind Speed (km/s)"],
        "Predicted Geomagnetic Index": lastPoint["Geomagnetic Index (Kp)"],
        isPrediction: false
      },
      {
        time: "+10m Forecast",
        "Predicted Wind Speed": Math.round(lastPoint["Solar Wind Speed (km/s)"] + avgWindDelta * 1.2),
        "Predicted Geomagnetic Index": parseFloat((lastPoint["Geomagnetic Index (Kp)"] + avgGeoDelta * 1.2).toFixed(1)),
        isPrediction: true
      },
      {
        time: "+20m Forecast",
        "Predicted Wind Speed": Math.round(lastPoint["Solar Wind Speed (km/s)"] + avgWindDelta * 2.4),
        "Predicted Geomagnetic Index": parseFloat((lastPoint["Geomagnetic Index (Kp)"] + avgGeoDelta * 2.4).toFixed(1)),
        isPrediction: true
      },
      {
        time: "+30m Forecast",
        "Predicted Wind Speed": Math.round(lastPoint["Solar Wind Speed (km/s)"] + avgWindDelta * 3.6),
        "Predicted Geomagnetic Index": parseFloat((lastPoint["Geomagnetic Index (Kp)"] + avgGeoDelta * 3.6).toFixed(1)),
        isPrediction: true
      }
    ];
  }

  // Combine both historical paths and prediction layers safely
  const combinedChartDataset = [...historicalData, ...predictedData.slice(1)];

  return (
    <div className="w-full h-[320px] bg-slate-50/50 p-2 rounded-xl border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={combinedChartDataset} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGeo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis yAxisId="left" stroke="#0ea5e9" fontSize={10} tickLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} tickLine={false} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
            formatter={(value, name) => [value, name]}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          
          {/* Historical Data Series (Solid Lines) */}
          <Area yAxisId="left" type="monotone" dataKey="Solar Wind Speed (km/s)" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorWind)" connectNulls />
          <Area yAxisId="right" type="monotone" dataKey="Geomagnetic Index (Kp)" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorGeo)" connectNulls />
          
          {/* Predictive Modeling Streams (Dashed Lines) */}
          <Line yAxisId="left" type="monotone" dataKey="Predicted Wind Speed" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls activeDot={{ r: 5 }} />
          <Line yAxisId="right" type="monotone" dataKey="Predicted Geomagnetic Index" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
