"use client"
import type { PlayerPicked } from "@/server/api/routers/squad-pick";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import ElementCard from "./element-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import DigitReel from "./digit-reel";
import useBootstrapStore from "@/stores/bootstrap";
type PickViewProps = {
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

export default function PickView({
  session
}: PickViewProps ) {

  const {data: bootstrap} = api.bootstrap.get.useQuery();
  const bootstrapStore = useBootstrapStore();


  const [managerId, setManagerId] = useState(session?.user?.manager?.managerId ?? "1");
  const [currentEventId, setCurrentEventId] = useState(bootstrapStore.currentEvent?.id ?? 1);
  const [valid, setValid] = useState(false);

  const { data, isLoading, error } = api.pick.getCurrentPickFromAPI.useQuery({ currentEvent: bootstrapStore.currentEvent?.id ?? 1, managerId })

  useEffect(() => {
  if (!bootstrapStore.bootstrap) {
    bootstrapStore.setBootstrap(bootstrap!)
    setCurrentEventId(bootstrapStore.currentEvent?.id ?? 1)
  }
}, [bootstrap, bootstrapStore.currentEvent])

  useEffect(() => {
    if (!session) {
      return
    }

    if (!session.user) {
      return
    }
    setManagerId(session.user.manager?.managerId ?? "1")
    // setCurrentEventId(bootstrapStore.currentEvent.id)
    setValid(true);


  }, [session])

  if (isLoading) return (
    <Skeleton />
  );
  if (error) return <div>Error loading picks: {error.message}</div>;

  if (!valid) return ( <Skeleton /> );

  const { points, event, event_transfers, event_transfers_cost } = data!.entry_history;
  const event_points = points.toString().padStart(2, "0")

  const played = data!.picks?.filter((pick: PlayerPicked) => [1,2, 3, 4, 5, 6, 7, 8, 9,10,11].includes(pick.position)) ?? [];
  const benched = data!.picks?.filter((pick: PlayerPicked) => [12, 13, 14, 15].includes(pick.position)) ?? [];

  const gkp_played = played.filter((pick: PlayerPicked) => pick.element_type === 1)
  const def_played = played.filter((pick: PlayerPicked) => pick.element_type === 2)
  const mid_played = played.filter((pick: PlayerPicked) => pick.element_type === 3)
  const fwd_played = played.filter((pick: PlayerPicked) => pick.element_type === 4)
  return (
    <div className="w-full flex flex-col justify-center items-center">

      <div className="w-full flex justify-center items-center gap-2">
        <GameweekTransfer event_transfers={event_transfers ?? 0} event_transfers_cost={event_transfers_cost ?? 0}/>
        <GameweekPoint currentEvent={ event } formattedValue={event_points}/>
      </div>
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full md:w-7/12 flex flex-col justify-center items-between  space-y-2 md:space-y-8"
        style={{ backgroundImage: "url('./pitch-default.svg')" }}
      >
          <ul className=" flex gap-2 justify-center">
            {gkp_played.length > 0 && (
              gkp_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {def_played.length > 0 && (
              def_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {mid_played.length > 0 && (
              mid_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                </li>
              ))
            )}
          </ul>

          <ul className=" flex gap-2 justify-evenly items-center">
            {fwd_played.length > 0 && (
              fwd_played.map((pick: PlayerPicked) => (
                <li key={pick.element}>
                  <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                </li>
              ))
            )}
          </ul>
      </div>
      <div className="w-full flex flex-col justify-center items-between">
        <Card className="p-0">
          <CardHeader className="p-2">
            <CardTitle className="flex justify-center">Bench</CardTitle>
            <ul className="flex gap-2 justify-evenly items-center">
                {benched.length > 0 && (
                  benched.map((pick: PlayerPicked) => (
                    <li key={pick.element}>
                      <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
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
      <div className="flex gap-2 justify-center items-center">
        <GameweekTransfer event_transfers={0} event_transfers_cost={0}/>
        <GameweekPoint />
      </div>
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full md:w-7/12 flex flex-col justify-center space-y-8"
        style={{ backgroundImage: "url('./pitch-default.svg')" }}
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
  return (
    <div className=" mt-[1.5em] py-8 flex flex-col gap-2">
      <div className="flex justify-center items-center">Transfers</div>
      <Card className="w-32 flex justify-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{ event_transfers } ({ event_transfers_cost > 0 ?  `-${event_transfers_cost}` : event_transfers_cost })</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
