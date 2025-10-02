'use client'

import type { Element } from "@/lib/bootstrap-type"
import { api } from "@/trpc/react"
import { X } from "lucide-react"
import { LabelList, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ReferenceLine, Line } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useIsMobile } from "@/hooks/use-mobile"

type AxisData = {
  dataKey: string,
  type: 'number',
  name: string,
  unit: string
}
type AppScatterPlotProps = {
  dataX: AxisData,
  dataY: AxisData
}
function AppScatterPlot({ dataX, dataY }: AppScatterPlotProps) {
  const isMobile = useIsMobile()
  const dataSeparation = [
    { label: "FWD", filter: (el: Element) => el.element_type == 4 && el.minutes > 50 && Number(el.points_per_game) > 3, fill: '#8884d8' },
    { label: "MID", filter: (el: Element) => el.element_type == 3 && el.minutes > 50 && Number(el.points_per_game) > 3, fill: '#82ca9d' },
    { label: "DEF", filter: (el: Element) => el.element_type == 2 && el.minutes > 50 && Number(el.points_per_game) > 2, fill: '#ff5b00' },
    { label: "GKP", filter: (el: Element) => el.element_type == 1 && el.minutes > 50 && Number(el.points_per_game) > 1, fill: '#ff00ff' }
  ]
  const { data: bootstrap, isLoading, isError } = api.bootstrap.get.useQuery();

  if (isError) return <Error />
  if (isLoading) return <Skeleton />
  if (!bootstrap) return <Skeleton />
  if (!bootstrap.elements) return <Skeleton />

  const PpGs = bootstrap.elements.map((el: Element) => Number(el.points_per_game)).filter((val number) => !isNaN(val) && val !== null && val !== undefined)
  const xpo5s = bootstrap.elements.map((el: Element) => (el.xp_o5_current ?? 0)).filter((val number) => !isNaN(val) && val !== null && val !== undefined);

  const maxPpG = PpGs.length > 0 ? Math.max(...PpGs.map(ppg => Number(ppg))) : 0
  const maxXpo5 = xpo5s.length > 0 ? Math.max(...xpo5s.map(ppg => Number(ppg))) : 0

  const bound = Math.ceil(Math.max(maxPpG, maxXpo5));

  // Debug: Log filtered data counts
  const filteredCounts = dataSeparation.map(sep => ({
    label: sep.label,
    count: bootstrap.elements.filter(sep.filter).length
  }));
  console.log('Filtered data counts:', filteredCounts);
  console.log('Total elements:', bootstrap.elements.length);
  console.log('Data bounds:', { maxPpG, maxXpo5, bound });
  return (
    <Card className="w-full !md:h-screen">
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          Pts/game vs XPo5_current
        </CardTitle>
        <CardDescription className={isMobile ? "text-sm" : "text-base"}>
          Point per game versus XPoint last 5 games
        </CardDescription>
      </CardHeader>      <CardContent className="md:h-screen p-2 sm:p-6 overflow-hidden">
        <ResponsiveContainer
          width="100%"
          height={isMobile ? 300 : '100%'}

        >
          <ScatterChart
            margin={
              isMobile
                ? { top: 20, right: 15, left: 15, bottom: 25 }
                : { top: 40, right: 40, left: 30, bottom: 50 }
            }
          >
            <XAxis
              {...dataX}
              domain={[0, bound]}
              fontSize={isMobile ? 10 : 12}
              tickMargin={isMobile ? 4 : 8}
              axisLine={!isMobile}
              tickLine={!isMobile}
            />
            <YAxis
              {...dataY}
              domain={[0, bound]}
              fontSize={isMobile ? 10 : 12}
              tickMargin={isMobile ? 4 : 8}
              width={isMobile ? 35 : 45}
              axisLine={!isMobile}
              tickLine={!isMobile}
            />

            <Tooltip
              cursor={isMobile ? false : { strokeDasharray: "3 3" }}
              contentStyle={isMobile ? { fontSize: '12px' } : {}}
            />
            {!isMobile && <Legend />}

            {/* Reference line showing where points per game equals expected points */}
            <Line
              type="linear"
              data={[
                { x: 0, y: 0 },
                { x: bound, y: bound }
              ]}
              stroke="#666"
              strokeDasharray="5 5"
              strokeWidth={isMobile ? 1 : 2}
              opacity={0.7}
              dot={false} // No dots on the diagonal line
            />
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: bound, y: bound }
              ]}
              stroke="#666"
              strokeDasharray="5 5"
              strokeWidth={isMobile ? 1 : 2}
              opacity={0.7}
            />

            {dataSeparation.map((obj: { label: string, filter: (el: Element) => boolean, fill: string }) => {
              const filteredData = bootstrap.elements.filter(obj.filter);
              console.log(`${obj.label} filtered data:`, filteredData.length, filteredData.slice(0, 2));

              return (
                <Scatter
                  key={obj.label}
                  name={obj.label}
                  data={filteredData}
                  fill={obj.fill}
                >
                    <LabelList
                      dataKey="web_name"
                      position="insideTop"
                      fontSize={isMobile ? 6 : 8}
                      offset={5}
                      className="fill-current text-[0.5em]"
                    />
                </Scatter>
              );
            })}
            <ReferenceLine
              x={0}
              y={0}
              stroke="red"
              strokeDasharray="3 3"
              label={{ value: 'PpG = XPo5', position: 'top', fontSize: isMobile ? 10 : 12 }}
            />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Mobile Legend - shown below chart on mobile */}
        {isMobile && (
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {dataSeparation.map((obj) => (
              <div key={obj.label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: obj.fill }}></div>
                <span className="text-xs text-muted-foreground">{obj.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Skeleton() {
  const isMobile = useIsMobile()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Loading...</CardTitle>
        <CardDescription className={isMobile ? "text-sm" : "text-base"}>
          Point per game versus XPoint last 5 games
        </CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'h-[250px]' : 'h-[400px]'} flex items-center justify-center`}>
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
          Failed to fetch data
        </CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'h-[250px]' : 'h-[400px]'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-2">
          <X className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-red-500`} />
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-red-500`}>Failed to fetch data</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AppScatterPlot;
