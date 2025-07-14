"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// export const description = "A stacked bar chart with a legend"

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ]

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--chart-1)",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "var(--chart-2)",
//   },
// } satisfies ChartConfig

type AxisData = {
  dataKey1: string,
  dataKey2?: string,
  fill1?: string,
  fill2?: string,
}
type BarChartProps<T> = {
  title: string,
  description: string,
  chartConfig: ChartConfig,
  chartData: T
  dataX: AxisData,
  dataY: AxisData,

}
export function DynamicStackedBarChart<T>({
  title,
  description,
  chartConfig,
  chartData,
  dataX,
  dataY,
}: BarChartProps<T>) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{ title }</CardTitle>
        <CardDescription>{ description }</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData as T[]}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={dataX.dataKey1}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey={dataY.dataKey1}
              stackId="a"
              fill={dataY.fill1 ?? 'var(--chart-1)'}
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey={dataY.dataKey2}
              stackId="a"
              fill={dataY.fill2 ?? 'var(--chart-2)'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
      </CardFooter>
    </Card>
  )
}
