import axios from "axios";
import { type CombinedDataPoint } from "@/components/workspace/AdvancedDataChart";

const API_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";
const BASE_URL = "https://api.nasa.gov/DONKI";

interface RawCmeResponse {
  activityID: string;
  startTime: string;
  cmeAnalyses?: Array<{
    speed: number;
    type: string;
  }>;
}

interface RawGstResponse {
  activityID: string;
  startTime: string;
  allKpIndex?: Array<{
    observedTime: string;
    kpIndex: number;
  }>;
}

export async function fetchCorrelatedSpaceWeather(startDate: string, endDate: string): Promise<CombinedDataPoint[]> {
  try {
    const [cmeResponse, gstResponse] = await Promise.all([
      axios.get<RawCmeResponse[]>(`${BASE_URL}/CME`, {
        params: { startDate, endDate, api_key: API_KEY }
      }),
      axios.get<RawGstResponse[]>(`${BASE_URL}/GST`, {
        params: { startDate, endDate, api_key: API_KEY }
      })
    ]);

    const timelineMap: Record<string, { solarVelocity: number; geomagneticIndex: number; entriesCount: number }> = {};

    cmeResponse.data.forEach((cme) => {
      const day = cme.startTime.split("T")[0];
      const analysis = cme.cmeAnalyses?.[0];
      const speed = analysis?.speed || 400;

      if (!timelineMap[day]) {
        timelineMap[day] = { solarVelocity: speed, geomagneticIndex: 1.5, entriesCount: 1 };
      } else {
        timelineMap[day].solarVelocity = Math.max(timelineMap[day].solarVelocity, speed);
      }
    });

    gstResponse.data.forEach((gst) => {
      gst.allKpIndex?.forEach((kp) => {
        const day = kp.observedTime.split("T")[0];
        const index = kp.kpIndex;

        if (!timelineMap[day]) {
          timelineMap[day] = { solarVelocity: 420, geomagneticIndex: index, entriesCount: 1 };
        } else {
          timelineMap[day].geomagneticIndex += index;
          timelineMap[day].entriesCount += 1;
        }
      });
    });

    const combinedData: CombinedDataPoint[] = Object.entries(timelineMap).map(([date, metrics]) => {
      const avgKp = Number((metrics.geomagneticIndex / metrics.entriesCount).toFixed(1));
      
      let contextualInsight = "Interplanetary magnetosphere metrics within expected safety tolerances.";
      if (metrics.solarVelocity > 800 && avgKp >= 5) {
        contextualInsight = `Correlative anomaly confirmed. Solar wind velocity surge directly matching a G${Math.floor(avgKp - 4)} atmospheric storm.`;
      } else if (metrics.solarVelocity > 900) {
        contextualInsight = "High velocity plasma ejection wave migrating past orbital paths. Earth field delay active.";
      } else if (avgKp >= 6) {
        contextualInsight = "Elevated geomagnetic storm registered. Inspect global tracking nodes for payload friction anomalies.";
      }

      return {
        timestamp: `${date}T12:00:00Z`,
        solarVelocity: Math.round(metrics.solarVelocity),
        geomagneticIndex: avgKp,
        insight: contextualInsight
      };
    });

    return combinedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  } catch (error) {
    console.error("Pipeline correlation synchronization failed:", error);
    throw new Error("Unable to link telemetry fields. Ensure gateway keys have valid infrastructure access permissions.");
  }
}
