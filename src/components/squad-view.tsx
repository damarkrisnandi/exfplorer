"use client"
import type { PickData, PlayerPicked } from "@/server/api/routers/squad-pick";
import { api } from "@/trpc/react";
import React, { useEffect, useState } from "react";
import ElementCard from "./element-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import useBootstrapStore from "@/stores/bootstrap";
import type { Element } from "@/lib/bootstrap-type";

type SumValue = {
  title: string,
  value: number,
  format: (value: number) => number | string
}
type SquadViewProps = {
  data?: PickData,

  title: string,
  description: string,

  sumData: SumValue[]
}
export default function SquadView({ data, title, description, sumData }: SquadViewProps) {


  // if (window === undefined) return <>Please wait...</>
  if (!data) return <>...</>

  const { event } = data.entry_history;

  const played = data.picks?.filter((pick: PlayerPicked) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(pick.position)) ?? [];
  const benched = data.picks?.filter((pick: PlayerPicked) => [12, 13, 14, 15].includes(pick.position)) ?? [];

  const gkp_played = played.filter((pick: PlayerPicked) => pick.element_type === 1)
  const def_played = played.filter((pick: PlayerPicked) => pick.element_type === 2)
  const mid_played = played.filter((pick: PlayerPicked) => pick.element_type === 3)
  const fwd_played = played.filter((pick: PlayerPicked) => pick.element_type === 4)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 h-full">
        <div className="flex gap-2 justify-center items-center">
          { sumData.map((sd: SumValue) => (
            <div key={sd.title}>
              <SumCard title={sd.title} value={sd.value} format={sd.format}/>
            </div>
          )) }

        </div>
        <div
          className="bg bg-cover bg-center h-[50vh] md:h-screen w-full flex flex-col justify-center items-between  space-y-2 md:space-y-6"
          style={{ backgroundImage: `url('${window.location.origin}/pitch-default.svg')` }}
        >
          <ul className=" flex gap-2 justify-center">
            {gkp_played.length > 0 && (
              gkp_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`} />
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {def_played.length > 0 && (
              def_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`} />
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {mid_played.length > 0 && (
              mid_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_o5_current ?? 0} xp={pick.xp_o5 ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`} />
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {fwd_played.length > 0 && (
              fwd_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`} />
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="w-full flex flex-col justify-center items-center space-y-2">
          <Card className="p-0 w-full bg-green-400">
            <CardHeader className="p-2">
              <CardTitle className="flex justify-center">Bench</CardTitle>
              <ul className="flex gap-2 justify-evenly items-center">
                {benched.length > 0 && (
                  benched.map((pick: PlayerPicked) => (
                    <li key={pick.element}>
                      <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`} />
                    </li>
                  ))
                )}
              </ul>
            </CardHeader>
          </Card>

        </div>
      </CardContent>
    </Card>
  );
}

export function SquadViewSkeleton({ title, description, sumData }: SquadViewProps) {

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{ title }</CardTitle>
          <CardDescription>{ description }</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-center items-center">
            { sumData.map((sd: SumValue) => (
              <div key={sd.title}>
                <SumCard title={sd.title} value={0} format={sd.format}/>
              </div>
            )) }
          </div>
          <div
            className="bg bg-cover bg-center h-[50vh] md:h-screen w-full flex flex-col justify-center space-y-8"
            style={{ backgroundImage: `url('${window.location.origin}/pitch-default.svg')` }}
          >
          </div>
        </CardContent>
      </Card>


    </div>
  )
}





function SumCard({ title, value, format }: SumValue) {
  const formattedValue = format(value);
  return (
    <div className="flex flex-col items-center mt-2 py-8">
      <p className="flex justify-center items-center text-xs">{title}</p>
      <div className="flex">
        <div className="w-24 h-20 bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white flex justify-center items-center rounded-lg">
          <p className="text-2xl font-bold text-white">{formattedValue}</p>
        </div>
      </div>
    </div>
  )
}

