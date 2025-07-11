'use client'
import { api } from "@/trpc/react";
import { DynamicBarChart } from "./bar-chart";
import type { ChartConfig } from "./ui/chart";
import type { Element } from "@/lib/bootstrap-type";

const chartConfig = {
  xp: {
    label: "XPoints",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig
type XP = {
  web_name: string,
  xp: number
}
const chartData: XP[] = [
  { web_name: "-", xp: 0 },
  { web_name: "-", xp: 0 },
  { web_name: "-", xp: 0 },
  { web_name: "-", xp: 0 },
  { web_name: "-", xp: 0 },
]
const XPtsBarChart = DynamicBarChart<XP[]>
export default function XPointso5Top5Visualization() {
  const baseProps = {
    dataX: { dataKey: 'web_name' },
    dataY: { dataKey: 'xp' },
    title: 'Top 5 XP',
    description: 'Top 5 Expected Points based on Last 5 Gameweek',
    chartConfig: chartConfig as ChartConfig,
    // chartData: chartData

  }
  const { data, isLoading, isError } = api.bootstrap.get.useQuery();
  if (isLoading) return <XPtsBarChart {...baseProps} chartData={chartData} />
  if (isError) return <XPtsBarChart {...baseProps} chartData={chartData} />
  if (!data) return <XPtsBarChart {...baseProps} chartData={chartData} />

  data.elements.sort((a: Element, b: Element) => (b.xp_o5_current ?? 0) - (a.xp_o5_current ?? 0))
  const finalChartData = data.elements.map((el: Element) => {
    return {
      web_name: el.web_name,
      xp: (el.xp_o5_current ?? 0)
    } as XP
  }).slice(0, 5)
  return (
    <XPtsBarChart {...baseProps} chartData={finalChartData} />
  )
}
