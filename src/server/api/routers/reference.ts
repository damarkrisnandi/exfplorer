import type { Bootstrap, Event } from "@/lib/bootstrap-type";
import type { Fixture } from "@/lib/fixture-type";
import type { LiveEvent } from "@/lib/live-event-type";
import { ARCHIVED_API_URL, BASE_API_URL, previousSeason } from "@/lib/utils";
import axios from "axios";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Reference } from "@/lib/reference-type";

// bootstrap-static
    const bootstrapQuery = axios.get(BASE_API_URL + `/bootstrap-static`, {
          headers: {}
    })
    .then((resp: { data: Bootstrap }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data");
    });

    const bootstrapHistoryQuery = axios.get(ARCHIVED_API_URL + `/${previousSeason}/bootstrap-static.json`, {
          headers: {}
    })
    .then((resp: { data: Bootstrap }) =>  resp.data)
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

    const last5Queries = (currentEvent: number) => [1,2,3,4,5]
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


    export const referenceRouter = createTRPCRouter({
      getAll: publicProcedure.query(async () => {
        const [
          bootstrap,
          bootstrapHistory,
          fixtures,
        ] = await Promise.all([
          bootstrapQuery,
          bootstrapHistoryQuery,
          fixturesQuery,
        ])
        const foundCurrentEvent = bootstrap.events.find((event: Event) => event.is_current);

        const liveEvents = await Promise.all(last5Queries(foundCurrentEvent ? foundCurrentEvent.id : 0))
        const reference: Reference = {
          bootstrap,
          bootstrapHistory,
          fixtures,
          fixturesHistory: fixtures,
          liveEvents
        }

        return reference
      })
    })
