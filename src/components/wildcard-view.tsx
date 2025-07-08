"use client"
import type { PlayerPicked } from "@/server/api/routers/squad-pick";
import { api } from "@/trpc/react";
import React, { useEffect, useState } from "react";
import ElementCard from "./element-card";
import { Card, CardHeader, CardTitle } from "./ui/card";
import DigitReel from "./digit-reel";
import useBootstrapStore from "@/stores/bootstrap";


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

  if (isLoading) return (
    <Skeleton />
  );
  if (error) return <div>Error loading picks: {error.message}</div>;

  if (!valid) return ( <Skeleton /> );

  if (!data) return ( <Skeleton /> );

  // const { points, event, event_transfers, event_transfers_cost } = data.entry_history;
  // const event_points = points.toString().padStart(2, "0")

  const played = data.picks?.filter((pick: PlayerPicked) => [1,2, 3, 4, 5, 6, 7, 8, 9,10,11].includes(pick.position)) ?? [];
  const benched = data.picks?.filter((pick: PlayerPicked) => [12, 13, 14, 15].includes(pick.position)) ?? [];

  const gkp_played = played.filter((pick: PlayerPicked) => pick.element_type === 1)
  const def_played = played.filter((pick: PlayerPicked) => pick.element_type === 2)
  const mid_played = played.filter((pick: PlayerPicked) => pick.element_type === 3)
  const fwd_played = played.filter((pick: PlayerPicked) => pick.element_type === 4)
  return (
    <div className="w-full flex flex-col justify-center items-center">

      <div className="w-full flex justify-center items-center gap-2">
        <h1>Wildcard Draft</h1>
      </div>
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full md:w-7/12 flex flex-col justify-center items-between  space-y-2 md:space-y-8"
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
        <Card className="p-0 w-full md:w-7/12 bg-green-400">
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
      {/* <div className="flex gap-2 justify-center items-center">
        <GameweekTransfer event_transfers={0} event_transfers_cost={0}/>
        <GameweekPoint />
      </div> */}
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full md:w-7/12 flex flex-col justify-center space-y-8"
        style={{ backgroundImage: `url('${window.location.origin}/pitch-default.svg')` }}
      >
      </div>
    </div>
  )
}

function GameweekPoint({ currentEvent, formattedValue}: { currentEvent?: number, formattedValue?: string}) {
  return (
    <div className="flex flex-col items-center mt-[1.5em] py-8">
        <div className="flex justify-center items-center">Gameweek { currentEvent ?? '-'}</div>
        <div className="flex">
            <DigitReel className="rounded-l-lg" value={formattedValue?.[0] ?? "0"} />
            <DigitReel className="rounded-r-lg" value={formattedValue?.[1] ?? "0"} />
        </div>
      </div>
  )
}

function GameweekTransfer({ event_transfers, event_transfers_cost}: { event_transfers: number, event_transfers_cost: number}) {
  const formattedValue = event_transfers.toString().padStart(2, "0")
  return (
    <div className="flex flex-col items-center mt-[1.5em] py-8">
      <div className="flex justify-center items-center">Transfers</div>
      <div className="flex">
          <DigitReel className="rounded-l-lg" value={formattedValue?.[0] ?? "0"} />
          <DigitReel className="rounded-r-lg" value={formattedValue?.[1] ?? "0"} />
      </div>
    </div>
  )
}
