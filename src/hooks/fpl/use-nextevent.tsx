'use client'

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const useNextEvent = ({ bootstrap }: any) => {
  const {
    data: nextEvent,
    isLoading: isLoadingNextEvent,
    error: errorNextEvent,
  } = useQuery({
    queryKey: ["nextEvent"],
    queryFn: () => {
      const allNextEvents = bootstrap.events.filter(
        (event: any) =>
          new Date(event.deadline_time).getTime() > new Date().getTime(),
      );

      return allNextEvents.length > 0
        ? allNextEvents[0]
        : { id: 38 };
    },
    enabled: !!bootstrap
  }); 

  return { nextEvent, isLoadingNextEvent, errorNextEvent }
}

export default useNextEvent;
