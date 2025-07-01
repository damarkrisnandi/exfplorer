import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { BASE_API_URL, getElementPhotoUrl } from "@/lib/utils";
import axios from "axios";
import type { Element, Event, GameConfig, Team } from "@/lib/bootstrap-type";
import { getExpectedPoints } from "@/lib/optimization";
import type { Fixture } from "@/lib/fixture-type";
import type { LiveEvent } from "@/lib/live-event-type";

export type PickData = {
  active_chip: string | null;
  automatic_subs: Array<{
    entry: number;
    element_in: number;
    element_out: number;
    event: number;
  }>;
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    percentile_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: Array<PlayerPicked>;
};

export type PlayerPicked = {
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
    element_type: number;

    web_name?: string,
    photo?: string,
    event_points?: number

    xp?:number,
    xp_o5?:number,
    xp_current?: number,
    xp_o5_current?: number,
    delta_xp?: number,
    delta_xp_05?: number
  }

export const pickRouter = createTRPCRouter({
  getCurrentPickFromAPI: protectedProcedure
  .input(z.object({
    managerId: z.string(),
    currentEvent: z.number().nullable()
  }))
  .query(async ({ input }) => {
    const { managerId, currentEvent } = input;
    if (!currentEvent) {
      return null;
    }
    const picksQuery = axios.get(BASE_API_URL + `/picks/${managerId}/${currentEvent}`, {
          headers: {}
    })
    .then((resp: { data: PickData }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data");
    });

    // bootstrap-static
    const bootstrapQuery = axios.get(BASE_API_URL + `/bootstrap-static`, {
          headers: {}
    })
    .then((resp: { data: {
      elements: Element[],
      game_config: GameConfig,
      teams: Team[],
      events: Event[]
    } }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data");
    });

    const fixturesQuery = axios.get(BASE_API_URL + `/fixtures`, {
          headers: {}
    })
    .then((resp: { data: Fixture[] }) => resp.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data");
    });

    const last5Queries = [1,2,3,4,5]
    .filter((n: number) =>  n <= currentEvent)
    .map((n: number) => {
      return axios.get(BASE_API_URL + `/live-event/${currentEvent - n - 1}`, {
        headers: {}
      })
      .then((resp: { data: LiveEvent }) =>  resp.data)
      .catch((error) => {
        console.error("Error fetching liveEvent:", error);
        throw new Error("Failed to fetch liveEvent");
      });
    })

    const [
      picksData,
      {
        elements,
        game_config,
        teams,
        events
      },
      fixtures,
      ...last5
    ] = await Promise.all([picksQuery, bootstrapQuery, fixturesQuery, ...last5Queries])

    // const {
    //   elements: responseElements,
    //   game_config,
    //   teams,
    //   events
    // }
    const finalData: PickData = {
      ...picksData,
      picks: picksData.picks.map((pick: PlayerPicked) => {
        const foundElement = elements.find((data: { id: number }) => data.id === pick.element);
        const foundCurrentEvent = events.find((data: Event) => data.is_current)

        const xp = getExpectedPoints({
          currentGameWeek: foundCurrentEvent ? foundCurrentEvent.id : 1,
          deltaEvent: 1,
          element: foundElement!,
          game_config,
          teams,
          fixtures,
        })

        const xp_current = getExpectedPoints({
          currentGameWeek: foundCurrentEvent ? foundCurrentEvent.id : 1,
          deltaEvent: 0,
          element: foundElement!,
          game_config,
          teams,
          fixtures,
        })

        const xp_o5 = getExpectedPoints({
          currentGameWeek: foundCurrentEvent ? foundCurrentEvent.id : 1,
          deltaEvent: 1,
          element: foundElement!,
          game_config,
          teams,
          fixtures,
          last5
        })

        const xp_o5_current = getExpectedPoints({
          currentGameWeek: foundCurrentEvent ? foundCurrentEvent.id : 1,
          deltaEvent: 0,
          element: foundElement!,
          game_config,
          teams,
          fixtures,
          last5
        })

        return {
          ...pick,
          web_name: foundElement ? foundElement.web_name : undefined,
          photo: foundElement ? getElementPhotoUrl(foundElement.photo ?? "") : undefined,
          event_points: foundElement ? foundElement.event_points : 0,

          xp,
          xp_current,
          xp_o5,
          xp_o5_current,
          delta_xp: (foundElement?.event_points ?? 0) - xp_o5_current
        };
      }),

    }
    return finalData
  })
})
