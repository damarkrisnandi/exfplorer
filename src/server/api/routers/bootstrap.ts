import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import type { Bootstrap, Element, Event } from "@/lib/bootstrap-type";
import { bootstrapHistoryQuery, bootstrapQuery, fixturesQuery, last5Queries } from "@/lib/api-queries";
import { getExpectedPoints } from "@/lib/optimization";

export const bootstrapRouter = createTRPCRouter({
  get: publicProcedure
    .query(async () => {
      const [
        bootstrap,
        bootstrapHistory,
        fixtures,
      ] = await Promise.all([bootstrapQuery, bootstrapHistoryQuery, fixturesQuery])

      const currentEvent = bootstrap.events.find((e: Event) => e.is_current);

      const [
        ...last5
      ] = await Promise.all(last5Queries(currentEvent?.id ?? 1))

      const newBootstrap: Bootstrap = {
        ...bootstrap,
        elements: bootstrap.elements.map((element: Element) => {
          const foundElementHistory = bootstrapHistory.elements.find((data: Element) => data.code === element.code);
          const foundCurrentEvent = bootstrap.events.find((data: Event) => data.is_current)

          const xpRef = {
            currentGameWeek: foundCurrentEvent ? foundCurrentEvent.id : 1,
            element,
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
            ...element,

            xp,
            xp_current,
            xp_o5,
            xp_o5_current

          }
        })

      }

      return newBootstrap
    }),

});
