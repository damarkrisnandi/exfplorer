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
    const [valid, setValid] = useState<boolean>(false);

    const { data, isLoading, error } = api.pick.getCurrentPickFromAPI.useQuery({ currentEvent: bootstrapStore.currentEvent?.id ?? null, managerId })

    useEffect(() => {
      if (!bootstrapStore.bootstrap) {
        bootstrapStore.setBootstrap(bootstrap!)
        setCurrentEventId(bootstrapStore.currentEvent?.id ?? 1)
        setValid(true);
      }
    }, [bootstrap, bootstrapStore, bootstrapStore.currentEvent])

    if (window === undefined) return <>Please wait...</>


    const sumDataTransfer = {
      title: 'Transfer',
      value: 0,
      format: (value: number) => value
    }
    const sumEventPoints = {
      title: `Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id : '-'}`,
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
    if (isLoading) return (<SquadViewSkeleton title={`${session.user.manager.entry_name}'s Picks`} description={`${session.user.manager.entry_name}'s Squad on Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : 1}`} sumData={sumDataSkeleton} />);
    if (!data) return (<SquadViewSkeleton title={`${session.user.manager.entry_name}'s Picks`} description={`${session.user.manager.entry_name}'s Squad on Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : 1}`} sumData={sumDataSkeleton} />);
    if (!valid) return (<SquadViewSkeleton title={`${session.user.manager.entry_name}'s Picks`} description={`${session.user.manager.entry_name}'s Squad on Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : 1}`} sumData={sumDataSkeleton} />);

    const { event_transfers, event_transfers_cost, points } = data.entry_history;

    const totalDeltaNumber = data.picks?.reduce((a: number, b: PlayerPicked) => a + ((b.event_points ?? 0) - (b.xp_o5_current ?? 0)), 0);

    const sumData = [
      {...sumDataTransfer, value: event_transfers, format: (value: number) => (`${event_transfers} (${event_transfers_cost > 0 ? '-'+event_transfers_cost : event_transfers_cost })`).toString()},
      {...sumEventPoints, value: points, format: (value: number) => value},
      {...sumDeltaXPoints, value: totalDeltaNumber, filter: (value: number) => value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
    ]

    return ( <SquadView data={data} title={`${session.user.manager.entry_name}'s Picks`} description={`${session.user.manager.entry_name}'s Squad on Gameweek ${bootstrapStore.currentEvent ? bootstrapStore.currentEvent.id + 1 : '-'}`} sumData={sumData} /> );
}
