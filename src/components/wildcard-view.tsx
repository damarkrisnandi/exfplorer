"use client"
import type { PlayerPicked } from "@/server/api/routers/squad-pick";
import { api } from "@/trpc/react";
import React, { useEffect, useState } from "react";

import useBootstrapStore from "@/stores/bootstrap";
import type { Element } from "@/lib/bootstrap-type";
import SquadView, { SquadViewSkeleton } from "./squad-view";

export default function WildcardView() {

  const { data: bootstrap } = api.bootstrap.get.useQuery();
  const bootstrapStore = useBootstrapStore();

  const [, setCurrentEventId] = useState(bootstrapStore.currentEvent?.id ?? 1);

  const { data, isLoading, error } = api.pick.getWildcardDraft.useQuery({ currentEvent: bootstrapStore.currentEvent?.id ?? null, })

  useEffect(() => {
    if (!bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap!)
      setCurrentEventId(bootstrapStore.currentEvent?.id ?? 1)
    }
  }, [bootstrap, bootstrapStore, bootstrapStore.currentEvent])

  if (window === undefined) return <>Please wait...</>


  const sumDataCostRef = {
    title: 'Cost',
    value: 0,
    format: (value: number) => `£${(value/10).toFixed(1)}m`
  }
  const sumDataXPRef = {
    title: `XP${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : '-'}`,
    value: 0,
    format: (value: number) => (value).toFixed(1)
  }

  const sumDataSkeleton = [
    sumDataCostRef,
    sumDataXPRef
  ]

  if (error) return <div>Error loading picks: {error.message}</div>;
  if (isLoading) return (<SquadViewSkeleton title="Wildcard Draft" description="Best Choices for hitting wildcard" sumData={sumDataSkeleton} />);
  if (!data) return (<SquadViewSkeleton title="Wildcard Draft" description="Best Choices for hitting wildcard" sumData={sumDataSkeleton} />);

  const played = data.picks?.filter((pick: PlayerPicked) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(pick.position)) ?? [];
  const totalCost = bootstrap?.elements
    .filter((el) => played.map((p: PlayerPicked) => p.element).includes(el.id))
    .reduce((a: number, item: Element) => a + item.now_cost, 0)
    ?? 0
  const totalXP = played.reduce((a: number, item: PlayerPicked) => a + (item.xp_o5 ?? 0), 0);

  const sumData = [
    {...sumDataCostRef, value: totalCost},
    {...sumDataXPRef, value: totalXP}
  ]

  return ( <SquadView data={data} title="Wildcard Draft" description="Best Choices for hitting wildcard" sumData={sumData} /> );
}
