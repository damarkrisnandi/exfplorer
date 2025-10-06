import { bootstrapHistoryQuery, bootstrapQuery, fixturesQuery, last5Queries } from "@/lib/api-queries";
import type { Bootstrap, Event } from "@/lib/bootstrap-type";
import type { Fixture } from "@/lib/fixture-type";
import type { LiveEvent } from "@/lib/live-event-type";
import { getExpectedPoints, optimizationProcess } from "@/lib/optimization";
import { BASE_API_URL, getElementPhotoUrl } from "@/lib/utils";
import type { XPoint } from "@/lib/xp-type";
import axios from "axios";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
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
          teams,
          events
        },
        {
          elements: elementsHistory
        },
        fixtures,
      ] = await Promise.all([picksQuery, bootstrapQuery, bootstrapHistoryQuery, fixturesQuery,])

      const viewNextFixtures = fixtures
        .filter((f: Fixture) => f.event === (currentEvent ?? 0) + 1)
        .map((f: Fixture) => {
          const homeTeam = teams.find((t) => t.id === f.team_a);
          const awayTeam = teams.find((t) => t.id === f.team_h);
          return {
            ...f,
            homeTeam: homeTeam?.name ?? "Unknown",
            awayTeam: awayTeam?.name ?? "Unknown"
          };
        })
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

          // Guard missing data
          if (!foundElement || !foundElementHistory) {
            return {
              ...pick,
              web_name: undefined,
              photo: undefined,
              event_points: 0,
              xp: 0,
              xp_current: 0,
              xp_o5: 0,
              xp_o5_current: 0,
              delta_xp: 0,
              delta_xp_05: 0,
              nextFixtures: []
            };
          }

          const currentGw = foundCurrentEvent ? foundCurrentEvent.id : 0;

          const xp = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: { teams } as Bootstrap,
            fixtures,
            last5: undefined,
            currentGameWeek: currentGw,
            deltaEvent: 1
          });
          const xp_current = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: { teams } as Bootstrap,
            fixtures,
            last5: undefined,
            currentGameWeek: currentGw,
            deltaEvent: 0
          });

          const xp_o5 = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: { teams } as Bootstrap,
            fixtures,
            last5,
            currentGameWeek: currentGw,
            deltaEvent: 1
          });
          const xp_o5_current = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: { teams } as Bootstrap,
            fixtures,
            last5,
            currentGameWeek: currentGw,
            deltaEvent: 0
          });

          return {
            ...pick,
            web_name: foundElement ? foundElement.web_name : undefined,
            photo: foundElement ? getElementPhotoUrl(foundElement.photo ?? "") : undefined,
            event_points: foundElement ? foundElement.event_points : 0,

            xp,
            xp_current,
            xp_o5: Math.round(xp_o5 * 100) / 100,
            xp_o5_current: Math.round(xp_o5_current * 100) / 100,
            delta_xp: (foundElement?.event_points ?? 0) - xp_current,
            delta_xp_05: (foundElement?.event_points ?? 0) - xp_o5_current,

            nextFixtures: viewNextFixtures
              .filter((f: Fixture) => f.team_a === foundElement?.team || f.team_h === foundElement?.team)
              .map((f: Fixture) => {
                // ...removed unused variables
                if (f.team_a === foundElement?.team) {
                  const opposite = teams.find((t) => t.id === f.team_h)?.short_name ?? "NONE";
                  return {
                    team: opposite,
                    event: f.event,
                    difficulty: f.team_a_difficulty,
                    teamId: f.team_a
                  }
                } else if (f.team_h === foundElement?.team) {
                  const opposite = teams.find((t) => t.id === f.team_a)?.short_name ?? "NONE";
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
        }),

      }
      return finalData
    }),

  getOptimizedPick: protectedProcedure
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
        bootstrap,
        bootstrapHistory,
        fixtures,
      ] = await Promise.all([picksQuery, bootstrapQuery, bootstrapHistoryQuery, fixturesQuery,])

      const {
        elements,
        teams,
        events
      } = bootstrap;
      const {
        elements: elementsHistory
      } = bootstrapHistory;

      const viewNextFixtures = fixtures
        .filter((f: Fixture) => f.event === (currentEvent ?? 0) + 1)
        .map((f: Fixture) => {
          const homeTeam = teams.find((t) => t.id === f.team_a);
          const awayTeam = teams.find((t) => t.id === f.team_h);
          return {
            ...f,
            homeTeam: homeTeam?.name ?? "Unknown",
            awayTeam: awayTeam?.name ?? "Unknown"
          };
        })
      const [...last5] = currentEvent ? await Promise.all(last5Queries(currentEvent)) : [];

      const reference = {
        bootstrap,
        bootstrapHistory,
        fixtures,
        _fixturesHistory: fixtures,
        last5,
        deltaEvent: 1
      }

      // optimizationProcess returns PlayerPicked[]
      const optimizedPicks = optimizationProcess({ ...reference, picksData });

      const finalData: PickData = {
        ...picksData,
        picks: optimizedPicks.map((pick: PlayerPicked) => {
          const foundElement = elements.find((data: { id: number }) => data.id === pick.element);
          const foundElementHistory = elementsHistory.find((data: { code: number }) => foundElement && data.code === foundElement.code);
          const foundCurrentEvent = events.find((data: Event) => data.is_current)

          if (!foundElement || !foundElementHistory) {
            return {
              ...pick,
              web_name: undefined,
              photo: undefined,
              event_points: 0,
              xp: 0,
              xp_current: 0,
              xp_o5: 0,
              xp_o5_current: 0,
              delta_xp: 0,
              delta_xp_05: 0,
              nextFixtures: []
            };
          }

          const currentGw = foundCurrentEvent ? foundCurrentEvent.id : 0;

          // Create a minimal bootstrap object with just the teams
          // The getExpectedPoints function only uses the teams property
          const bootstrapObj = { teams } as Bootstrap;

          const xp = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5: undefined,
            currentGameWeek: currentGw,
            deltaEvent: 1
          });
          const xp_current = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5: undefined,
            currentGameWeek: currentGw,
            deltaEvent: 0
          });
          const xp_o5 = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5,
            currentGameWeek: currentGw,
            deltaEvent: 1
          });
          const xp_o5_current = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5,
            currentGameWeek: currentGw,
            deltaEvent: 0
          });

          return {
            ...pick,
            web_name: foundElement ? foundElement.web_name : undefined,
            photo: foundElement ? getElementPhotoUrl(foundElement.photo ?? "") : undefined,
            event_points: foundElement ? foundElement.event_points : 0,

            xp,
            xp_current,
            xp_o5: Math.round(xp_o5 * 100) / 100,
            xp_o5_current: Math.round(xp_o5_current * 100) / 100,
            delta_xp: (foundElement?.event_points ?? 0) - xp_current,
            delta_xp_05: (foundElement?.event_points ?? 0) - xp_o5_current,

            nextFixtures: viewNextFixtures
              .filter((f: Fixture) => f.team_a === foundElement?.team || f.team_h === foundElement?.team)
              .map((f: Fixture) => {
                if (f.team_a === foundElement?.team) {
                  const opposite = teams.find((t) => t.id === f.team_h)?.short_name ?? "NONE";
                  return {
                    team: opposite,
                    event: f.event,
                    difficulty: f.team_a_difficulty,
                    teamId: f.team_a
                  }
                } else if (f.team_h === foundElement?.team) {
                  const opposite = teams.find((t) => t.id === f.team_a)?.short_name ?? "NONE";
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
        }),

      }

      console.log('finalData', finalData)
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
        _fixturesHistory: fixtures,
        last5,
        deltaEvent: 1
      }
      // First, generate wildcard picks from full pool
      const wildCardDraftPicks = optimizationProcess({ ...reference });

      // Build a PickData using wildcard picks to feed into a second optimization (if desired)
      const currentGwId = bootstrap.events.find((e) => e.is_current)?.id ?? 1;
      const wcPickData: PickData = {
        active_chip: null,
        automatic_subs: [],
        entry_history: {
          event: currentGwId,
          points: 0,
          total_points: 0,
          rank: 0,
          rank_sort: 0,
          overall_rank: 0,
          percentile_rank: 0,
          bank: 1000,
          value: 1000,
          event_transfers: 0,
          event_transfers_cost: 0,
          points_on_bench: 0,
        },
        picks: wildCardDraftPicks.map((p) => ({
          element: p.element,
          position: p.position ?? 1,
          multiplier: p.multiplier ?? 1,
          is_captain: p.is_captain ?? false,
          is_vice_captain: p.is_vice_captain ?? false,
          element_type: p.element_type,
        })),
      };

      // Optionally re-optimize using those picks as constraints
      const optimizedPicks = optimizationProcess({ ...reference, picksData: wcPickData });

      const finalData: PickData = {
        ...wcPickData,
        picks: optimizedPicks.map((pick: PlayerPicked) => {
          const foundElement = bootstrap.elements.find((data: { id: number }) => data.id === pick.element);
          const foundElementHistory = bootstrapHistory.elements.find((data: { code: number }) => foundElement && data.code === foundElement.code);
          const foundCurrentEvent = bootstrap.events.find((data: Event) => data.is_current)

          if (!foundElement || !foundElementHistory) {
            return {
              ...pick,
              web_name: undefined,
              photo: undefined,
              event_points: 0,
              xp: 0,
              xp_current: 0,
              xp_o5: 0,
              xp_o5_current: 0,
              delta_xp: 0,
              delta_xp_05: 0,
              nextFixtures: []
            };
          }

          const currentGw = foundCurrentEvent ? foundCurrentEvent.id : 0;

          // Create a minimal bootstrap object with just the teams
          // The getExpectedPoints function only uses the teams property
          const bootstrapObj = { teams: bootstrap.teams } as Bootstrap;

          const xp = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5: undefined,
            currentGameWeek: currentGw,
            deltaEvent: 1
          })
          const xp_current = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5: undefined,
            currentGameWeek: currentGw,
            deltaEvent: 0
          })

          const xp_o5 = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5,
            currentGameWeek: currentGw,
            deltaEvent: 1
          })
          const xp_o5_current = getExpectedPoints({
            element: foundElement,
            elementHistory: foundElementHistory,
            bootstrap: bootstrapObj,
            fixtures,
            last5,
            currentGameWeek: currentGw,
            deltaEvent: 0
          })

          return {
            ...pick,
            web_name: foundElement ? foundElement.web_name : undefined,
            photo: foundElement ? getElementPhotoUrl(foundElement.photo ?? "") : undefined,
            event_points: foundElement ? foundElement.event_points : 0,

            xp,
            xp_current,
            xp_o5: Math.round(xp_o5 * 100) / 100,
            xp_o5_current: Math.round(xp_o5_current * 100) / 100,
            delta_xp: (foundElement?.event_points ?? 0) - xp_o5_current,
            delta_xp_05: (foundElement?.event_points ?? 0) - xp_o5_current,

            nextFixtures: viewNextFixtures
              .filter((f: Fixture) => f.team_a === foundElement?.team || f.team_h === foundElement?.team)
              .map((f: Fixture) => {
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
