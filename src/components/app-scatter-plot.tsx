'use client'

import type { Element } from "@/lib/bootstrap-type"
import { api } from "@/trpc/react"
import { Ellipsis, X } from "lucide-react"
import { LabelList, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useIsMobile } from "@/hooks/use-mobile"

type AxisData = {
  dataKey: string,
  type: 'number',
  name: string,
  unit: string
}
type AppScatterPlotProps = {
  className?: string
  // dataSeparation: {
  //   label: string,
  //   filter: (el: Element) => boolean,
  //   fill: string
  // }[],
  dataX: AxisData,
  dataY: AxisData
}
function AppScatterPlot({ className, dataX, dataY }: AppScatterPlotProps) {
  const isMobile = useIsMobile()
  const dataSeparation = [
    { label: "FWD", filter: (el: Element) => el.element_type == 4 && el.minutes > 90 && Number(el.points_per_game) > 5, fill: '#8884d8' },
    { label: "MID", filter: (el: Element) => el.element_type == 3 && el.minutes > 90 && Number(el.points_per_game) > 5, fill: '#82ca9d' },
    { label: "DEF", filter: (el: Element) => el.element_type == 2 && el.minutes > 90 && Number(el.points_per_game) > 3, fill: '#ff5b00' },
    { label: "GKP", filter: (el: Element) => el.element_type == 1 && el.minutes > 90 && Number(el.points_per_game) > 2, fill: '#ff00ff' }
  ]
  const { data: bootstrap, isLoading, isError } = api.bootstrap.get.useQuery();

  if (isError) return <Error />
  if (isLoading) return <Skeleton />
  if (!bootstrap) return <Skeleton />
  if (!bootstrap.elements) return <Skeleton />

  const PpGs = bootstrap.elements.map((el: Element) => Number(el.points_per_game))
  const xpo5s =  bootstrap.elements.map((el: Element) => (el.xp_o5_current ?? 0));

  const maxPpG = Math.max(...PpGs)
  const maxXpo5 = Math.max(...xpo5s)

  const bound = Math.max(maxPpG, maxXpo5) + 0.2;

  return (
    <Card className="w-full !h-fit">
      <CardHeader>
        <CardTitle>Pts/game vs XPo5_current</CardTitle>
        <CardDescription>Point per game versus XPoint last 5 games</CardDescription>
      </CardHeader>
      <CardContent className="!h-fit min-h-[300px]">
        <ResponsiveContainer height={isMobile ? "100%" : "40%"} width={isMobile ? "100%" : "40%"} minHeight={300} minWidth={100} aspect={1.0 / 1.0}>
          <ScatterChart
            width={400}
            height={400}
            margin={{
              top: 20,
              right: 20,
              bottom: 10,
              left: 10,
            }}
          >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis {...dataX} domain={[0, bound]} />
            <YAxis {...dataY} width={20} domain={[0, bound]} />

            {/* <Tooltip cursor={{ strokeDasharray: "3 3" }} /> */}
            <Legend />
            {dataSeparation.map((obj: { label: string, filter: (el: Element) => boolean, fill: string }) => (
              <Scatter key={obj.label} name={obj.label} data={bootstrap.elements.filter((el: Element) => obj.filter(el))} fill={obj.fill}>
                <LabelList dataKey="web_name" position="left" />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
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

export default AppScatterPlot;
