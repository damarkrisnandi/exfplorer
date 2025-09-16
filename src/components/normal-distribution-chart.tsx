'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Element } from "@/lib/bootstrap-type"
import { api } from "@/trpc/react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Chart configuration with colors for each position
const chartConfig = {
  gkp_points: {
    label: "GKP (%)",
    color: "#8884d8",
  },
  def_points: {
    label: "DEF (%)",
    color: "#82ca9d",
  },
  mid_points: {
    label: "MID (%)",
    color: "#ffc658",
  },
  fwd_points: {
    label: "FWD (%)",
    color: "#ff7300",
  },
} satisfies ChartConfig

type DistributionPoint = {
  x: string  // Changed from number to string for categories
  gkp_points?: number
  def_points?: number
  mid_points?: number
  fwd_points?: number
}

// Simple histogram approach with categorized point ranges
function generateHistogramData(elements: Element[]): DistributionPoint[] {
  // Group points by position, filtering only players who actually played (minutes > 0)
  const gkpPoints = elements
    .filter(el => el.element_type === 1 && el.minutes > 0)
    .map(el => Number(el.points_per_game) ?? 0)
  const defPoints = elements
    .filter(el => el.element_type === 2 && el.minutes > 0)
    .map(el => Number(el.points_per_game) ?? 0)
  const midPoints = elements
    .filter(el => el.element_type === 3 && el.minutes > 0)
    .map(el => Number(el.points_per_game) ?? 0)
  const fwdPoints = elements
    .filter(el => el.element_type === 4 && el.minutes > 0)
    .map(el => Number(el.points_per_game) ?? 0)

  console.log('Point distributions (players with minutes > 0):', {
    gkpPoints: gkpPoints.length,
    defPoints: defPoints.length,
    midPoints: midPoints.length,
    fwdPoints: fwdPoints.length
  })

  // Get total counts for percentage calculation
  const totalGkp = gkpPoints.length
  const totalDef = defPoints.length
  const totalMid = midPoints.length
  const totalFwd = fwdPoints.length

  // Define categories
  const categories = [
    { label: 'E (0-1)', min: 0, max: 1 },
    { label: 'D (2-4)', min: 2, max: 4 },
    { label: 'C (5-6)', min: 5, max: 6 },
    { label: 'B (7-9)', min: 7, max: 9 },
    { label: 'A (>9)', min: 10, max: Infinity },
  ]

  const result: DistributionPoint[] = []

  categories.forEach(category => {
    const point: DistributionPoint = { x: category.label }

    // Count players in each category for each position
    const gkpCount = gkpPoints.filter(p => p >= category.min && p <= category.max).length
    const defCount = defPoints.filter(p => p >= category.min && p <= category.max).length
    const midCount = midPoints.filter(p => p >= category.min && p <= category.max).length
    const fwdCount = fwdPoints.filter(p => p >= category.min && p <= category.max).length

    // Convert to percentages
    point.gkp_points = totalGkp > 0 ? Math.round((gkpCount / totalGkp) * 100 * 10) / 10 : 0
    point.def_points = totalDef > 0 ? Math.round((defCount / totalDef) * 100 * 10) / 10 : 0
    point.mid_points = totalMid > 0 ? Math.round((midCount / totalMid) * 100 * 10) / 10 : 0
    point.fwd_points = totalFwd > 0 ? Math.round((fwdCount / totalFwd) * 100 * 10) / 10 : 0

    result.push(point)
  })

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
          Points Distribution by Category
        </CardTitle>
        <CardDescription className={isMobile ? "text-sm" : "text-base"}>
          Distribution of players across performance categories (only players with minutes played)
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
                  ? { top: 10, right: 10, left: 5, bottom: 60 }
                  : { top: 20, right: 30, left: 20, bottom: 40 }
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.3}
                className={isMobile ? "stroke-1" : "stroke-2"}
              />
              <XAxis
                dataKey="x"
                fontSize={isMobile ? 10 : 12}
                tickMargin={isMobile ? 4 : 8}
                axisLine={!isMobile}
                tickLine={!isMobile}
                interval={0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 60 : 40}
              />
              <YAxis
                tickFormatter={(value: number) => `${value}%`}
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
