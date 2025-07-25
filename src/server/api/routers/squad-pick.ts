import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { ARCHIVED_API_URL, BASE_API_URL, currentSeason, getElementPhotoUrl, previousSeason } from "@/lib/utils";
import axios from "axios";
import type { Bootstrap, Event } from "@/lib/bootstrap-type";
import { getExpectedPoints, optimizationProcess } from "@/lib/optimization";
import type { Fixture } from "@/lib/fixture-type";
import type { LiveEvent } from "@/lib/live-event-type";
import type { XPoint } from "@/lib/xp-type";
import { bootstrapHistoryQuery, bootstrapQuery, fixturesQuery, last5Queries } from "@/lib/api-queries";
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
  event_points?: number,
  nextFixtures?: {
    team: string;
    event: number;
    difficulty: number;
    teamId: number;
  }[],
} & XPoint




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
        .then((resp: { data: PickData }) => resp.data)
        .catch((error) => {
          console.error("Error fetching data:", error);
          throw new Error("Failed to fetch data");
        });



      const [
        picksData,
        {
          elements,
          game_config,
          teams,
          events
        },
        {
          elements: elementsHistory
        },
        fixtures,
      ] = await Promise.all([picksQuery, bootstrapQuery, bootstrapHistoryQuery, fixturesQuery,])

      const [...last5] = currentEvent ? await Promise.all(last5Queries(currentEvent)) : [];
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
          const foundElementHistory = elementsHistory.find((data: { code: number }) => foundElement && data.code === foundElement.code);
          const foundCurrentEvent = events.find((data: Event) => data.is_current)

          const xpRef = {
            currentGameWeek: foundCurrentEvent ? foundCurrentEvent.id : 0,
            element: foundElement!,
            game_config,
            teams,
            fixtures,
            elementHistory: foundElementHistory!,
            fixturesHistory: fixtures,
          }

          const xp = getExpectedPoints({ ...xpRef, deltaEvent: 1, });
          const xp_current = getExpectedPoints({ ...xpRef, deltaEvent: 0, });
          const xp_o5 = getExpectedPoints({ ...xpRef, deltaEvent: 1, last5 })
          const xp_o5_current = getExpectedPoints({ ...xpRef, deltaEvent: 0, last5 })

          return {
            ...pick,
            web_name: foundElement ? foundElement.web_name : undefined,
            photo: foundElement ? getElementPhotoUrl(foundElement.photo ?? "") : undefined,
            event_points: foundElement ? foundElement.event_points : 0,

            xp,
            xp_current,
            xp_o5,
            xp_o5_current,
            delta_xp: (foundElement?.event_points ?? 0) - xp_current,
            delta_xp_05: (foundElement?.event_points ?? 0) - xp_o5_current
          };
        }),

      }
      return finalData
    }),

  getWildcardDraft: publicProcedure
    .input(z.object({
      currentEvent: z.number().nullable()
    }))
    .query(async ({ input }) => {
      const { currentEvent } = input;




      const [
        bootstrap,
        bootstrapHistory,
        fixtures,
      ] = await Promise.all([bootstrapQuery, bootstrapHistoryQuery, fixturesQuery])

      const viewNextFixtures = fixtures
        .filter((f: Fixture) => f.event === (currentEvent ?? 0) + 1)
        .map((f: Fixture) => {
          const homeTeam = bootstrap.teams.find((t) => t.id === f.team_a);
          const awayTeam = bootstrap.teams.find((t) => t.id === f.team_h);
          return {
            ...f,
            homeTeam: homeTeam?.name ?? "Unknown",
            awayTeam: awayTeam?.name ?? "Unknown"
          };
        })

      let last5: LiveEvent[] | undefined = undefined;
      if (currentEvent) {
        last5 = await Promise.all(last5Queries(currentEvent));
      }
      const reference = {
        bootstrap,
        bootstrapHistory,
        fixtures,
        fixturesHistory: fixtures,
        last5
      }
      const wildCardDraftAsPickData = optimizationProcess({ ...reference });
      const picksData = optimizationProcess({ ...reference, picksData: wildCardDraftAsPickData });


      const finalData: PickData = {
        ...picksData,
        picks: picksData.picks.map((pick: PlayerPicked) => {
          const foundElement = bootstrap.elements.find((data: { id: number }) => data.id === pick.element);
          const foundElementHistory = bootstrapHistory.elements.find((data: { code: number }) => foundElement && data.code === foundElement.code);
          const foundCurrentEvent = bootstrap.events.find((data: Event) => data.is_current)

          const xpRef = {
            currentGameWeek: foundCurrentEvent ? foundCurrentEvent.id : 0,
            element: foundElement!,
            game_config: bootstrap.game_config,
            teams: bootstrap.teams,
            fixtures,
            elementHistory: foundElementHistory!,
            fixturesHistory: fixtures,
          }
          const xp = getExpectedPoints({ ...xpRef, deltaEvent: 1 })
          const xp_current = getExpectedPoints({ ...xpRef, deltaEvent: 0 })

          const xp_o5 = getExpectedPoints({ ...xpRef, deltaEvent: 1, last5 })
          const xp_o5_current = getExpectedPoints({ ...xpRef, deltaEvent: 0, last5 })

          return {
            ...pick,
            web_name: foundElement ? foundElement.web_name : undefined,
            photo: foundElement ? getElementPhotoUrl(foundElement.photo ?? "") : undefined,
            event_points: foundElement ? foundElement.event_points : 0,

            xp,
            xp_current,
            xp_o5,
            xp_o5_current,
            delta_xp: (foundElement?.event_points ?? 0) - xp_o5_current,

            nextFixtures: viewNextFixtures
              .filter((f: Fixture) => f.team_a === foundElement?.team || f.team_h === foundElement?.team)
              .map((f: Fixture) => {
                const elementTeam = bootstrap.teams.find((t) => t.id === f.team_a || t.id === f.team_h);
                const team = bootstrap.teams.find((t) => t.id === f.team_a || t.id === f.team_h)?.short_name ?? "NONE";

                if (f.team_a === foundElement?.team) {
                  const opposite = bootstrap.teams.find((t) => t.id === f.team_h)?.short_name ?? "NONE";
                  return {
                    team: opposite,
                    event: f.event,
                    difficulty: f.team_a_difficulty,
                    teamId: f.team_a
                  }
                } else if (f.team_h === foundElement?.team) {
                  const opposite = bootstrap.teams.find((t) => t.id === f.team_a)?.short_name ?? "NONE";
                  return {
                    team: opposite,
                    event: f.event,
                    difficulty: f.team_h_difficulty,
                    teamId: f.team_h
                  }
                } else {
                  // If the element's team is not in the fixture, return null
                  return null;
                }
              })
              .filter((fixture): fixture is { team: string; event: number; difficulty: number; teamId: number } => fixture !== null)
          };
        })
      }

      return finalData;
    })
})
