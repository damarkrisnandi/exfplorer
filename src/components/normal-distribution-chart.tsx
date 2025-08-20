'use client'

import { api } from "@/trpc/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import type { Element } from "@/lib/bootstrap-type"
import { useIsMobile } from "@/hooks/use-mobile"

// Chart configuration with colors for each position
const chartConfig = {
  gkp_points: {
    label: "Event Points",
    color: "#8884d8",
  },
  def_points: {
    label: "Event Points",
    color: "#82ca9d",
  },
  mid_points: {
    label: "Event Points",
    color: "#ffc658",
  },
  fwd_points: {
    label: "Event Points",
    color: "#ff7300",
  },
} satisfies ChartConfig

type DistributionPoint = {
  x: number
  gkp_points?: number
  def_points?: number
  mid_points?: number
  fwd_points?: number
}

// Simple histogram approach instead of normal distribution
function generateHistogramData(elements: Element[]): DistributionPoint[] {
  // Group points by position
  const gkpPoints = elements.filter(el => el.element_type === 1).map(el => el.event_points ?? 0)
  const defPoints = elements.filter(el => el.element_type === 2).map(el => el.event_points ?? 0)
  const midPoints = elements.filter(el => el.element_type === 3).map(el => el.event_points ?? 0)
  const fwdPoints = elements.filter(el => el.element_type === 4).map(el => el.event_points ?? 0)

  console.log('Point distributions:', { gkpPoints, defPoints, midPoints, fwdPoints })

  // Create histogram bins
  const maxPoints = 20 // Most players don't score more than 20 points
  const binWidth = 1
  const result: DistributionPoint[] = []

  for (let i = 0; i <= maxPoints; i += binWidth) {
    const x = i
    const point: DistributionPoint = { x }

    // Count players in each bin for each position
    const gkpCount = gkpPoints.filter(p => p >= i && p < i + binWidth).length
    const defCount = defPoints.filter(p => p >= i && p < i + binWidth).length
    const midCount = midPoints.filter(p => p >= i && p < i + binWidth).length
    const fwdCount = fwdPoints.filter(p => p >= i && p < i + binWidth).length

    point.gkp_points = gkpCount
    point.def_points = defCount
    point.mid_points = midCount
    point.fwd_points = fwdCount

    result.push(point)
  }

  return result
}

function Skeleton() {
  const isMobile = useIsMobile()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Loading...</CardTitle>
        <CardDescription className={isMobile ? "text-sm" : "text-base"}>
          Points Distribution by Position
        </CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'h-[300px]' : 'h-[400px]'} flex items-center justify-center`}>
        <div className={`animate-spin rounded-full border-b-2 border-gray-900 ${isMobile ? 'h-16 w-16' : 'h-32 w-32'}`}></div>
      </CardContent>
    </Card>
  )
}

function Error() {
  const isMobile = useIsMobile()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Error</CardTitle>
        <CardDescription className={isMobile ? "text-sm" : "text-base"}>
          Failed to load distribution data
        </CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'h-[300px]' : 'h-[400px]'} flex items-center justify-center`}>
        <div className={`text-red-500 ${isMobile ? 'text-sm' : 'text-base'}`}>Unable to load data</div>
      </CardContent>
    </Card>
  )
}

export default function NormalDistributionChart() {
  const isMobile = useIsMobile()
  const { data: bootstrap, isLoading, isError } = api.bootstrap.get.useQuery()

  if (isError) return <Error />
  if (isLoading) return <Skeleton />
  if (!bootstrap?.elements) return <Skeleton />

  const distributionData = generateHistogramData(bootstrap.elements)

  console.log('Distribution data sample:', distributionData.slice(0, 5))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          Points Distribution by Position
        </CardTitle>
        <CardDescription className={isMobile ? "text-sm" : "text-base"}>
          Distribution of event points across different player positions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className={`w-full ${isMobile ? 'h-[300px]' : 'h-[400px] md:h-[500px]'}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={distributionData}
              margin={
                isMobile
                  ? { top: 10, right: 10, left: 5, bottom: 5 }
                  : { top: 20, right: 30, left: 20, bottom: 5 }
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.3}
                className={isMobile ? "stroke-1" : "stroke-2"}
              />
              <XAxis
                dataKey="x"
                tickFormatter={(value: number) => value.toString()}
                fontSize={isMobile ? 10 : 12}
                tickMargin={isMobile ? 4 : 8}
                axisLine={!isMobile}
                tickLine={!isMobile}
              />
              <YAxis
                tickFormatter={(value: number) => value.toString()}
                fontSize={isMobile ? 10 : 12}
                tickMargin={isMobile ? 4 : 8}
                width={isMobile ? 25 : 35}
                axisLine={!isMobile}
                tickLine={!isMobile}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={isMobile ? false : { strokeDasharray: "3 3" }}
              />
              {!isMobile && <Legend />}

              <Line
                type="monotone"
                dataKey="gkp_points"
                stroke="#8884d8"
                strokeWidth={isMobile ? 1.5 : 2}
                dot={false}
                name="GKP"
                activeDot={isMobile ? { r: 3 } : { r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="def_points"
                stroke="#82ca9d"
                strokeWidth={isMobile ? 1.5 : 2}
                dot={false}
                name="DEF"
                activeDot={isMobile ? { r: 3 } : { r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="mid_points"
                stroke="#ffc658"
                strokeWidth={isMobile ? 1.5 : 2}
                dot={false}
                name="MID"
                activeDot={isMobile ? { r: 3 } : { r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="fwd_points"
                stroke="#ff7300"
                strokeWidth={isMobile ? 1.5 : 2}
                dot={false}
                name="FWD"
                activeDot={isMobile ? { r: 3 } : { r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Mobile Legend - shown below chart on mobile */}
        {isMobile && (
          <div className="flex flex-wrap justify-center gap-3 mt-3 px-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#8884d8]"></div>
              <span className="text-xs text-muted-foreground">GKP</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#82ca9d]"></div>
              <span className="text-xs text-muted-foreground">DEF</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#ffc658]"></div>
              <span className="text-xs text-muted-foreground">MID</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#ff7300]"></div>
              <span className="text-xs text-muted-foreground">FWD</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
