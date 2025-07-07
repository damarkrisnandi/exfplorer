"use client"

import type { Event } from "@/lib/bootstrap-type";
import type { Reference } from "@/lib/reference-type";
import { fromStorage } from "@/lib/storage";
import useReferenceStore from "@/stores/reference";
import { api } from "@/trpc/react";
import useBootstrap from "./use-bootstrap";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getArchivedBootstrap, getBootstrapFromStorage, getFixtures, getLiveEventData } from "@/services";
import { previousSeason } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function useReference() {
  const { reference, setReference } = useReferenceStore();

  const results = useQueries({
    queries: [
      {
        queryKey: ["bootstrap"],
        queryFn: async () => await getBootstrapFromStorage(),
      },
      {
        queryKey: ["fixtures"],
        queryFn: async () => await getFixtures(),
      },
      {
        queryKey: ["bootstrapHistory"],
        queryFn: async () => await getArchivedBootstrap(previousSeason),
      },
    ],
  });

  const [
    { data: bootstrap, isLoading: isLoadingBootstrap, isError: isErrorBootstrap },
    { data: fixtures, isLoading: isLoadingFixtures, isError: isErrorFixtures },
    { data: bootstrapHistory, isLoading: isLoadingBootstrapHistory, isError: isErrorBootstrapHistory },
  ] = results;

  const currentEvent = useMemo(() => !isLoadingBootstrap && !isErrorBootstrap ?  bootstrap?.events.find((event: Event) => event.is_current) : null, [bootstrap, !isLoadingBootstrap, !isErrorBootstrap])

  const last5 = useQueries({
    queries: [
      {
        queryKey: ["liveEvent", currentEvent ? currentEvent.id : 0],
        queryFn: async () => currentEvent ? await getLiveEventData(currentEvent.id) : new Promise((resolve) => resolve(null)),
        enabled: !isLoadingBootstrap && !isErrorBootstrap && !!bootstrap && !!currentEvent
      },
      {
        queryKey: ["liveEvent", currentEvent ? currentEvent.id - 1 : 0],
        queryFn: async () => currentEvent ? await getLiveEventData(currentEvent.id - 1) : new Promise((resolve) => resolve(null)),
        enabled: !isLoadingBootstrap && !isErrorBootstrap && !!bootstrap && !!currentEvent
      },
      {
        queryKey: ["liveEvent", currentEvent ? currentEvent.id - 2 : 0],
        queryFn: async () => currentEvent ? await getLiveEventData(currentEvent.id - 2) : new Promise((resolve) => resolve(null)),
        enabled: !isLoadingBootstrap && !isErrorBootstrap && !!bootstrap && !!currentEvent
      },
      {
        queryKey: ["liveEvent", currentEvent ? currentEvent.id - 3 : 0],
        queryFn: async () => currentEvent ? await getLiveEventData(currentEvent.id - 3) : new Promise((resolve) => resolve(null)),
        enabled: !isLoadingBootstrap && !isErrorBootstrap && !!bootstrap && !!currentEvent
      },
      {
        queryKey: ["liveEvent", currentEvent ? currentEvent.id - 4 : 0],
        queryFn: async () => currentEvent ? await getLiveEventData(currentEvent.id - 4) : new Promise((resolve) => resolve(null)),
        enabled: !isLoadingBootstrap && !isErrorBootstrap && !!bootstrap && !!currentEvent
      },
    ],
  })


  return {
    bootstrap,
    bootstrapHistory,
    fixtures,
    fixturesHistory: fixtures,
    liveEvents: last5.map(({ data }) => data),

    isLoading: isLoadingBootstrap || isLoadingFixtures || isLoadingBootstrapHistory,
    isError: isErrorBootstrap || isErrorFixtures || isErrorBootstrapHistory,
  } as Reference;
}
