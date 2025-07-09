"use client"

import { Ellipsis, TrendingUp, X } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, YAxis } from "recharts"

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { api } from "@/trpc/react"
import type { ChipUsage, EventManager } from "@/lib/manager-history-type"

export const description = "A line chart with a custom label"

// const chartData = [
//   { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
//   { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
//   { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
//   { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
//   { browser: "other", visitors: 90, fill: "var(--color-other)" },
// ]

const chartConfig = {
  rank: {
    label: "",
    color: "var(--chart-1)",
  },
  wildcard: {
    label: "WildCard",
    color: "var(--chart-2)",
  },
  freehit: {
    label: "FreeHIt",
    color: "var(--chart-2)",
  },
  '3xc': {
    label: "Triple Captain",
    color: "var(--chart-2)",
  },
  bboost: {
    label: "Bench Boost",
    color: "var(--chart-2)",
  },
  manager: {
    label: "Assistant Manager",
    color: "var(--chart-2)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

type AppLineChartProps = {
  session: {
    user: {
      manager: {
        id: string,
        managerId: string,
        player_first_name: string,
        player_last_name: string,
        entry_name: string
      }
    }
  }
}
export function AppLineChart({ session }: AppLineChartProps) {
  const { data: managerHistory, isLoading, isError  } = api.manager.fetchManagerHistory.useQuery({ managerId: session?.user?.manager?.managerId ?? null })

  if (isError) return <Error />
  if (isLoading) return <Skeleton />
  if (!managerHistory) return <Skeleton />
  const chartData = managerHistory.current.map((data: EventManager) => {
    //  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" }
    const chipUsage = managerHistory.chips.find((chip: ChipUsage) => chip.event === data.event)
    return {
      chip: chipUsage?.name ?? '',
      rank: data.overall_rank,
      fill: chipUsage ? `var(--color-${chipUsage.name})` : `var(--color-rank)`
    }
  })
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Overall Ranks</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <YAxis reversed />
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="rank"
                  hideLabel
                />
              }
            />
            <Line
              dataKey="rank"
              type="natural"
              stroke="var(--color-rank)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-rank)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                dataKey="chip"
                // formatter={(value: keyof typeof chartConfig) =>
                //   chartConfig[value]?.label
                // }
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Your Current Rank <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing OR and chips usage
        </div>
      </CardFooter>
    </Card>
  )
}


function Skeleton() {
  return (
    <div className="w-full h-52">
      <div className="flex justify-center items-center">
        <Ellipsis className="w-10 h-10 animate-pulse" />
      </div>
    </div>
  )
}

function Error() {
  return (
    <div className="w-full h-52">
      <div className="flex flex-col justify-center items-center">
        <X className="w-10 h-10" />
        <p className="text-sm">Failed to fetch data </p>
      </div>
    </div>
  )
}
