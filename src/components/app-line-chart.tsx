"use client"

import { ChevronDown, ChevronDownCircle, ChevronUpCircle, Ellipsis, TrendingUp, X } from "lucide-react"
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
  // ChartTooltip,
  // ChartTooltipContent,
} from "@/components/ui/chart"
import { api } from "@/trpc/react"
import type { ChipUsage, EventManager } from "@/lib/manager-history-type"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

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

const DataFormatter = (number: number) => {
  if(number > 1000000000){
    return (number/1000000000).toString() + 'B';
  }else if(number > 1000000){
    return (number/1000000).toString() + 'M';
  }else if(number > 1000){
    return (number/1000).toString() + 'K';
  }else{
    return number.toString();
  }
}

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
  const chartData = managerHistory.current.map((data: EventManager, currIndex: number) => {
    //  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" }
    const chipUsage = managerHistory.chips.find((chip: ChipUsage) => chip.event === data.event)
    const conditionalFill = (data: EventManager, index: number) => {
      if (index === 0) return 'var(--color-rank)'

      if (!managerHistory) return 'var(--color-rank)'
      if (!managerHistory.current) return 'var(--color-rank)'
      // if (!managerHistory.current[index - 1]) return 'var(--color-rank)'

      if (data.overall_rank <= (managerHistory.current[index - 1]?.overall_rank ?? 6000000)) {
        return 'green'
      } else {
        return 'red'
      }
    }

    const changes = (data: EventManager, index: number) => {
      if (index === 0) return 0

      if (!managerHistory) return 0
      if (!managerHistory.current) return 0
      // if (!managerHistory.current[index - 1]) return 0

      if (data.overall_rank < (managerHistory.current[index - 1]?.overall_rank ?? 6000000)) {
        return 1
      } else if (data.overall_rank > (managerHistory.current[index - 1]?.overall_rank ?? 3000000)) {
        return -1
      }

      return 0
    }
    return {
      chip: chipUsage?.name ?? '',
      rank: data.overall_rank,
      fill: conditionalFill(data, currIndex),
      change: changes(data, currIndex)
    }
  })

  const CustomizedDot = (props: {cx?: number, payload?: {fill: string},  cy?: number, value?: number}) => {
    const [rise, setRise] = useState<boolean>(false);
    const [drop, setDrop] = useState<boolean>(false);

    useEffect(() => {
      setTimeout(() => {
        setRise(true);
        setDrop(true);
      }, 2000)
    }, [])

  const { cx, cy, payload } = props;

  if (payload?.fill === 'green') {
    return (
      <ChevronUpCircle x={cx ? cx - 5 : 0} y={cy ? cy - 5 : 0} width={10} height={10} className={cn(
        'transition-all translate-y-20 opacity-0 ease-in-out',
        rise ? 'translate-y-0 opacity-100' : '',
        "w-[0.3em] h-[0.3em] text-green-500"
      )} />
    );
  }

  if (payload?.fill === 'red') {

    return (
      <ChevronDownCircle x={cx ? cx - 5 : 0} y={cy ? cy - 5 : 0} width={10} height={10} className={cn(
        'transition-all -translate-y-20 opacity-0 ease-in-out',
        drop ? 'translate-y-0 opacity-100': '',
        "w-[0.3em] h-[0.3em] text-red-500"
      )} />
    );
  }

  return (
      <></>
  );
};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Overall Ranks</CardTitle>
        <CardDescription>Overall Ranks Changes every Gameweek this season</CardDescription>
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
            <YAxis tickFormatter={DataFormatter} width={20} reversed />
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
              // dot={{
              //   fill: "var(--color-rank)",
              // }}
              dot={<CustomizedDot />}
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
          {session.user.manager.entry_name}&apos;s Overall Rank Changes <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing OR and chips usage
        </div>
      </CardFooter>
    </Card>
  )
}


function Skeleton() {
  const skeletonData = Array.from({ length: 38 }, () => {
    return {
      chip: '',
      rank: 3000000,
      fill:  `var(--color-rank)`
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
            data={skeletonData}
            margin={{
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <YAxis tickFormatter={DataFormatter} width={20} reversed />
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
