"use client"
import type { PlayerPicked } from "@/server/api/routers/squad-pick";
import { api } from "@/trpc/react";
import React, { useEffect, useState } from "react";
import useBootstrapStore from "@/stores/bootstrap";
import SquadView, { SquadViewSkeleton } from "./squad-view";
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


    const { data: bootstrap } = api.bootstrap.get.useQuery();
    const bootstrapStore = useBootstrapStore();


    const [managerId, ] = useState(session?.user?.manager?.managerId ?? "1");
    const [, setCurrentEventId] = useState(bootstrapStore.currentEvent?.id ?? 1);

    const { data, isLoading, error } = api.pick.getCurrentPickFromAPI.useQuery({ currentEvent: bootstrapStore.currentEvent?.id ?? null, managerId })

    useEffect(() => {
      if (!bootstrapStore.bootstrap) {
        bootstrapStore.setBootstrap(bootstrap!)
        setCurrentEventId(bootstrapStore.currentEvent?.id ?? 1)
      }
    }, [bootstrap, bootstrapStore, bootstrapStore.currentEvent])

    if (window === undefined) return <>Please wait...</>


    const sumDataTransfer = {
      title: 'Transfer',
      value: 0,
      format: (value: number) => value
    }
    const sumEventPoints = {
      title: `Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : '-'}`,
      value: 0,
      format: (value: number) => value
    }
    const sumDeltaXPoints = {
      title: `Δ(xP${ bootstrapStore?.currentEvent?.id ?? '-' },P${ bootstrapStore?.currentEvent?.id ?? '-'})`,
      value: 0,
      format: (value: number) => value.toFixed(1)
    }

    const sumDataSkeleton = [
      sumDataTransfer,
      sumEventPoints,
      sumDeltaXPoints
    ]
    if (error) return <div>Error loading picks: {error.message}</div>;
    if (isLoading) return (<SquadViewSkeleton title={`${session.user.manager.entry_name}'s Picks`} description={`${session.user.manager.entry_name}'s Squad on Gameweek Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : '-'}`} sumData={sumDataSkeleton} />);
    if (!data) return (<SquadViewSkeleton title={`${session.user.manager.entry_name}'s Picks`} description={`${session.user.manager.entry_name}'s Squad on Gameweek Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : '-'}`} sumData={sumDataSkeleton} />);

    const { event_transfers, event_transfers_cost } = data.entry_history;


    const totalDeltaNumber = data.picks?.reduce((a: number, b: PlayerPicked) => a + ((b.event_points ?? 0) - (b.xp_o5_current ?? 0)), 0);

    const totalDelta = totalDeltaNumber >= 0 ? `+${totalDeltaNumber.toFixed(1)}` : totalDeltaNumber.toFixed(1)
    const sumData = [
      {...sumDataTransfer, value: event_transfers, format: (value: number) => (`${event_transfers} (${event_transfers_cost > 0 ? '-'+event_transfers_cost : event_transfers_cost })`).toString()},
      sumEventPoints,
      {...sumDeltaXPoints, value: totalDeltaNumber, filter: (value: number) => totalDelta}
    ]

    return ( <SquadView title={`${session.user.manager.entry_name}'s Picks`} description={`${session.user.manager.entry_name}'s Squad on Gameweek Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : '-'}`} sumData={sumData} /> );
}
