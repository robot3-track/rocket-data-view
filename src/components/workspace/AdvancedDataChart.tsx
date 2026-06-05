import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from "recharts";

export interface CombinedDataPoint {
  timestamp: string;
  solarVelocity: number;       
  geomagneticIndex: number;    
  insight?: string;
}

interface AdvancedDataChartProps {
  data: CombinedDataPoint[];
}

export function AdvancedDataChart({ data }: AdvancedDataChartProps) {
  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return tickItem;
    }
  };

  return (
    <div className="w-full h-[380px] mt-2 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{ top: 15, right: 5, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.12}/>
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.00}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
          
          <XAxis 
            dataKey="timestamp" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxis}
            dy={10}
          />
          
          <YAxis 
            yAxisId="left" 
            stroke="#0284c7" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickCount={6}
            unit=" km/s"
          />
          
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#d97706" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            domain={[0, 9]}
            tickCount={10}
            dx={10}
            unit=" Kp"
          />
          
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const current = payload[0].payload as CombinedDataPoint;
                return (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xl max-w-[280px] space-y-2.5 backdrop-blur animate-fade-in">
                    <p className="text-xs font-semibold text-slate-400">
                      {new Date(current.timestamp).toLocaleString()}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Solar Velocity:</span>
                        <span className="text-sky-600 font-bold font-mono">{current.solarVelocity} km/s</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Geomagnetic Index:</span>
                        <span className="text-amber-600 font-bold font-mono">{current.geomagneticIndex} Kp</span>
                      </div>
                    </div>
                    {current.insight && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] leading-relaxed text-slate-500 font-normal">
                        ✨ {current.insight}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Legend 
            verticalAlign="top" 
            height={40} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
          />
          
          <Area 
            yAxisId="left" 
            type="monotone" 
            dataKey="solarVelocity" 
            stroke="#0284c7" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorSolar)" 
            name="Solar Wind Velocity" 
          />
          
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="geomagneticIndex" 
            stroke="#d97706" 
            strokeWidth={2.5} 
            dot={{ r: 2, strokeWidth: 1, fill: "#fff" }}
            activeDot={{ r: 5 }}
            name="Geomagnetic Kp-Index" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
