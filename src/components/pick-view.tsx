"use client"
import type { PlayerPicked } from "@/server/api/routers/squad-pick";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import ElementCard from "./element-card";

export default function PickView() {
  const { data: session } = useSession();

  const [managerId, setManagerId] = useState(session?.user?.manager?.managerId ?? "1");

  const { data, isLoading, error } = api.pick.getCurrentPickFromAPI.useQuery({
    currentEvent: 38,
    managerId
  })

  useEffect(() => {
    if (!session) {
      return
    }

    if (!session.user) {
      return
    }
    setManagerId(session.user.manager?.managerId ?? "1")
  }, [session])

  if (isLoading) return (
    <Skeleton />
  );
  if (error) return <div>Error loading picks: {error.message}</div>;

  const played = data!.picks?.filter((pick: PlayerPicked) => [1,2, 3, 4, 5, 6, 7, 8, 9,10,11].includes(pick.position)) ?? [];
  const benched = data!.picks?.filter((pick: PlayerPicked) => [12, 13, 14, 15].includes(pick.position)) ?? [];

  const gkp_played = played.filter((pick: PlayerPicked) => pick.element_type === 1)
  const def_played = played.filter((pick: PlayerPicked) => pick.element_type === 2)
  const mid_played = played.filter((pick: PlayerPicked) => pick.element_type === 3)
  const fwd_played = played.filter((pick: PlayerPicked) => pick.element_type === 4)
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full md:w-7/12 flex flex-col justify-center items-between  space-y-8"
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
        <div className="h-full w-full flex flex-col justify-center items-between">
          <ul className="py-10 flex gap-2 justify-evenly items-center">
              {benched.length > 0 && (
                benched.map((pick: PlayerPicked) => (
                  <li key={pick.element}>
                    <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
                  </li>
                ))
              )}
          </ul>

        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  const dataSkeleton = {
      // "position": 1,
      "multiplier": 0,
      "is_captain": false,
      "is_vice_captain": false,
      // "element_type": 2,
      "web_name": "",
      "photo": "https://placehold.co/20x20",
      "event_points": 0
  }

  const skeleton_gkp = Array.from({ length: 1 }, (data: PlayerPicked, i: number) => { return {
    ...data,
    ...dataSkeleton,
    element: i + 1,
    element_type: 1,
    position: 1
  }})

  const skeleton_def = Array.from({ length: 4 }, (data: PlayerPicked, i: number) => { return {
    ...data,
    ...dataSkeleton,
    element: i + 1,
    element_type: 2,
    position: i + 1
  }})

  const skeleton_mid = Array.from({ length: 4 }, (data: PlayerPicked, i: number) => { return {
    ...data,
    ...dataSkeleton,
    element: i + 1,
    element_type: 3,
    position: i + 1
  }})

  const skeleton_fwd = Array.from({ length: 2 }, (data: PlayerPicked, i: number) => { return {
    ...data,
    ...dataSkeleton,
    element: i + 1,
    element_type: 4,
    position: i + 1
  }})

  const skeleton_benched = Array.from({ length: 4 }, (data: PlayerPicked, i: number) => { return {
    ...data,
    ...dataSkeleton,
    element: i + 1,
    element_type: 4,
    position: i + 1
  }})
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div
        className="bg bg-cover bg-center h-72 md:h-screen w-full md:w-7/12 flex flex-col justify-center space-y-8"
        style={{ backgroundImage: "url('./pitch-default.svg')" }}
      >
        <ul className=" flex gap-2 justify-center">
          {skeleton_gkp.length > 0 && (
            skeleton_gkp.map((pick: PlayerPicked) => (
              <li key={pick.element}>
                <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
              </li>
            ))
          )}
        </ul>

        <ul className=" flex gap-2 justify-evenly items-center">
          {skeleton_def.length > 0 && (
            skeleton_def.map((pick: PlayerPicked) => (
              <li key={pick.element}>
                <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
              </li>
            ))
          )}
        </ul>

        <ul className=" flex gap-2 justify-evenly items-center">
          {skeleton_mid.length > 0 && (
            skeleton_mid.map((pick: PlayerPicked) => (
              <li key={pick.element}>
                <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
              </li>
            ))
          )}
        </ul>

        <ul className=" flex gap-2 justify-evenly items-center">
          {skeleton_fwd.length > 0 && (
            skeleton_fwd.map((pick: PlayerPicked) => (
              <li key={pick.element}>
                <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
              </li>
            ))
          )}
        </ul>
      </div>
      <ul className="py-10 flex gap-2 justify-evenly items-center">
          {skeleton_benched.length > 0 && (
            skeleton_benched.map((pick: PlayerPicked) => (
              <li key={pick.element}>
                <ElementCard {...pick} event_points={pick.event_points ?? 0} photo={pick.photo ?? `https://placehold.co/20x20?text=${pick.web_name ? pick.web_name[0] : 'PL'}`}/>
              </li>
            ))
          )}
        </ul>
    </div>
  )
}
