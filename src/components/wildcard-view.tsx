"use client"
import type { PlayerPicked } from "@/server/api/routers/squad-pick";
import { api } from "@/trpc/react";
import React, { useEffect, useState } from "react";
import ElementCard from "./element-card";
import { Card, CardHeader, CardTitle } from "./ui/card";
import useBootstrapStore from "@/stores/bootstrap";
import type { Element } from "@/lib/bootstrap-type";


export default function WildcardView() {

  const {data: bootstrap} = api.bootstrap.get.useQuery();
  const bootstrapStore = useBootstrapStore();

  const [, setCurrentEventId] = useState(bootstrapStore.currentEvent?.id ?? 1);
  const [valid, setValid] = useState(false);

  const { data, isLoading, error } = api.pick.getWildcardDraft.useQuery({currentEvent: bootstrapStore.currentEvent?.id ?? null,})

  useEffect(() => {
  if (!bootstrapStore.bootstrap) {
    bootstrapStore.setBootstrap(bootstrap!)
    setCurrentEventId(bootstrapStore.currentEvent?.id ?? 1)
  }
}, [bootstrap, bootstrapStore, bootstrapStore.currentEvent])

  if (window === undefined) return <>Please wait...</>
  if (isLoading) return (
    <Skeleton />
  );
  if (error) return <div>Error loading picks: {error.message}</div>;

  if (!data) return ( <Skeleton /> );

  const { event } = data.entry_history;
  // const event_points = points.toString().padStart(2, "0")


  const played = data.picks?.filter((pick: PlayerPicked) => [1,2, 3, 4, 5, 6, 7, 8, 9,10,11].includes(pick.position)) ?? [];
  const benched = data.picks?.filter((pick: PlayerPicked) => [12, 13, 14, 15].includes(pick.position)) ?? [];

  const gkp_played = played.filter((pick: PlayerPicked) => pick.element_type === 1)
  const def_played = played.filter((pick: PlayerPicked) => pick.element_type === 2)
  const mid_played = played.filter((pick: PlayerPicked) => pick.element_type === 3)
  const fwd_played = played.filter((pick: PlayerPicked) => pick.element_type === 4)
  const totalCost = bootstrap?.elements
  .filter((el) => played.map((p: PlayerPicked) => p.element).includes(el.id))
  .reduce((a: number, item: Element) => a + item.now_cost, 0)
  ?? 0
  const totalXP = played.reduce((a: number, item: PlayerPicked) => a + (item.xp_o5 ?? 0), 0).toFixed(1);
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">

      <div className="w-full flex justify-center items-center gap-2">
        <h1>Wildcard Draft</h1>
      </div>

      <div className="flex gap-2 justify-center items-center">
        <Cost cost={ totalCost }/>
        <ExpectedPoints currentEvent={ event } formattedValue={ totalXP } />
      </div>
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full flex flex-col justify-center items-between  space-y-2 md:space-y-8"
        style={{ backgroundImage: `url('${window.location.origin}/pitch-default.svg')` }}
      >
          <ul className=" flex gap-2 justify-center">
            {gkp_played.length > 0 && (
              gkp_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {def_played.length > 0 && (
              def_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {mid_played.length > 0 && (
              mid_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_o5_current ?? 0} xp={pick.xp_o5 ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {fwd_played.length > 0 && (
              fwd_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
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
                      <ElementCard {...pick} xp_current={pick.xp_current ?? 0} xp={pick.xp ?? 0} delta_xp={pick.delta_xp ?? 0} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                    </li>
                  ))
                )}
            </ul>
          </CardHeader>
        </Card>

      </div>
    </div>
  );
}

function Skeleton() {

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full flex justify-center items-center gap-2">
        <h1>Wildcard Draft</h1>
      </div>
      <div className="flex gap-2 justify-center items-center">
        <Cost cost={0}/>
        <ExpectedPoints />
      </div>
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full flex flex-col justify-center space-y-8"
        style={{ backgroundImage: `url('${window.location.origin}/pitch-default.svg')` }}
      >
      </div>
    </div>
  )
}


function ExpectedPoints({ currentEvent, formattedValue }: { currentEvent?: number, formattedValue?: string}) {
  return (
    <div className="flex flex-col items-center mt-[1.5em] py-8">
        <div className="flex justify-center items-center">XP{ currentEvent ? currentEvent + 1 : '-'}</div>
        <div className="flex">
            <div className="w-20 h-20 bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white flex justify-center items-center rounded-lg">
              <p className="text-2xl text-white font-bold">{formattedValue}</p>
            </div>
        </div>
      </div>
  )
}


function Cost({ cost }: { cost: number }) {
  const formattedValue = (cost/10).toFixed(1);
  return (
    <div className="flex flex-col items-center mt-[1.5em] py-8">
      <div className="flex justify-center items-center">Cost</div>
      <div className="flex">
        <div className="w-20 h-20 bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white flex justify-center items-center rounded-lg">
          <p className="text-2xl font-bold text-white">{formattedValue}£</p>
        </div>
      </div>
    </div>
  )
}

