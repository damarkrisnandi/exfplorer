'use client'
import { api } from "@/trpc/react";
import type { ChartConfig } from "./ui/chart";
import type { Element } from "@/lib/bootstrap-type";
import { DynamicStackedBarChart } from "./bar-chart-stacked";

const chartConfig = {
  xp: {
    label: "XPoints",
    color: "var(--chart-1)",
  },
  event_points: {
    label: "Points",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
type XP = {
  web_name: string,
  xp: number,
  event_points: number,
}
const chartData: XP[] = [
  { web_name: "-", xp: 1, event_points: 3 },
  { web_name: "-", xp: 1, event_points: 3 },
  { web_name: "-", xp: 1, event_points: 3 },
  { web_name: "-", xp: 1, event_points: 3 },
  { web_name: "-", xp: 1, event_points: 3 },
]
const XDeltaPtsStackedBarChart = DynamicStackedBarChart<XP[]>
export default function DeltaXPointsof5Top5Visualization() {
  const baseProps = {
    dataX: { dataKey1: 'web_name' },
    dataY: { dataKey1: 'xp', dataKey2: 'event_points', fill1: 'var(--chart-1)', fill2: 'var(--chart-2)' },
    title: 'Top 5 Delta XP',
    description: 'Top 5 High Diff Gameweek Point vs XPoints (XPo5)',
    chartConfig: chartConfig as ChartConfig,
    // chartData: chartData

  }
  const { data, isLoading, isError } = api.bootstrap.get.useQuery();
  if (isLoading) return <XDeltaPtsStackedBarChart {...baseProps} chartData={chartData} />
  if (isError) return <XDeltaPtsStackedBarChart {...baseProps} chartData={chartData} />
  if (!data) return <XDeltaPtsStackedBarChart {...baseProps} chartData={chartData} />

  data.elements.sort((a: Element, b: Element) => ((b.event_points ?? 0) - (b.xp_o5_current ?? 0)) - ((a.event_points ?? 0) - (a.xp_o5_current ?? 0)))
  const finalChartData = data.elements
  .filter((el) => el.element_type !== 5) // exclude manager
  .map((el: Element) => {
    return {
      web_name: el.web_name,
      xp: (el.xp_o5_current ?? 0),
      event_points: el.event_points
    } as XP
  }).slice(0, 5)
  return (
    <XDeltaPtsStackedBarChart {...baseProps} chartData={finalChartData} />
  )
}
