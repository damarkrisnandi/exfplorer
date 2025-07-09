import AppScatterPlot from "@/components/app-scatter-plot";
import type { Element } from "@/lib/bootstrap-type";


export default function DataVisualization() {
  const dataXPpg = { dataKey: "points_per_game", type: "number" as 'number', name: "pts/game", unit: "pts/game" };
  const dataXCurr = { dataKey: "event_points", type: "number" as 'number', name: "Event Points", unit: "Pts" };
  const dataY = { dataKey: "xp_o5_current", type: "number" as 'number', name: "xP", unit: "xP" };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">Current Event Points vs Expected Points</h1>

      <AppScatterPlot dataX={dataXPpg} dataY={dataY} />
    </div>
  )
}
