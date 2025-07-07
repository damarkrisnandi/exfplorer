import { useQuery } from "@tanstack/react-query";

const useCurrentEvent = ({ bootstrap }: any) => {
  const {
    data: currentEvent,
    isLoading: isLoadingCurrentEvent,
    error: errorCurrentEvent,
  } = useQuery({
    queryKey: ["currentEvent"],
    queryFn: () => {
      
      const currentAndPreviousEvents = bootstrap.events.filter(
        (event: any) =>
          new Date(event.deadline_time).getTime() <= new Date().getTime(),
      );

      return currentAndPreviousEvents.length > 0
        ? currentAndPreviousEvents.at(-1)
        : { id: 0 };
    },
    enabled: !!bootstrap
  });

  return { currentEvent, isLoadingCurrentEvent, errorCurrentEvent}
} 

export default useCurrentEvent;
