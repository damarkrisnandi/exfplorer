import AppScatterPlot from "@/components/app-scatter-plot";
import XPointsTop5Visualization from "@/components/xp-top5";
import XPointso5Top5Visualization from "@/components/xpo5-top5";
import type { Element } from "@/lib/bootstrap-type";


export default function DataVisualization() {
  const dataXPpg = { dataKey: "points_per_game", type: "number" as 'number', name: "pts/game", unit: "pts/game" };
  const dataXCurr = { dataKey: "event_points", type: "number" as 'number', name: "Event Points", unit: "Pts" };
  const dataY = { dataKey: "xp_o5_current", type: "number" as 'number', name: "xP", unit: "xP" };

  return (
    <div className="w-full flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Data visualization that you may needed</h1>

      <AppScatterPlot dataX={dataXPpg} dataY={dataY} />

      <div className="flex flex-col md:flex-row gap-2">
            <XPointsTop5Visualization />
            <XPointso5Top5Visualization />
      </div>
    </div>
  )
}
