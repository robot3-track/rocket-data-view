import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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
  // Map out a timeline sequence overlaying the NASA wind metrics with simulated ionosphere noise
  const chartData = streams.map((s, index) => {
    // Extract numerical speed safely from string "Solar Wind Speed (515 km/s)"
    const match = s.metric.match(/\d+/);
    const windSpeed = match ? parseInt(match[0], 10) : 400 + (s.deviation * 100);
    
    // Create secondary cross-referenced data points to overlay
    const geomagneticIndex = parseFloat((Math.abs(s.deviation) * 2.1 + 1.2).toFixed(1));
    const signalAttenuation = parseFloat((Math.abs(s.deviation) * 12 + 5).toFixed(0));

    return {
      time: s.timestamp || `T-${index}`,
      "Solar Wind Speed (km/s)": windSpeed,
      "Geomagnetic Index (Kp)": geomagneticIndex,
      "Signal Noise (dB)": signalAttenuation,
    };
  }).reverse(); // Reverse to keep timeline chronological (past -> present)

  return (
    <div className="w-full h-[320px] bg-slate-50/50 p-2 rounded-xl border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGeo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#0ea5e9" 
            fontSize={10} 
            tickLine={false} 
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#f59e0b" 
            fontSize={10} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="Solar Wind Speed (km/s)" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorWind)" 
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="Geomagnetic Index (Kp)" 
            stroke="#f59e0b" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorGeo)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
