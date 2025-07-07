import axios from "axios"

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { BASE_API_URL } from "@/lib/utils";
import { z } from "zod";
import type { LiveEvent } from "@/lib/live-event-type";


export const liveEventRouter = createTRPCRouter({
  getByCurrentEvent: publicProcedure
  .input(z.object({
    currentEvent: z.number().nullable()
  }))
  .query(async ({ input }) => {
    const { currentEvent } = input;
    if (!currentEvent) {
      return null;
    }
    const liveEventFromAPI = await axios.get(BASE_API_URL + `/live-event/${currentEvent}`, {
      headers: {}
    })
    .then((resp: { data: LiveEvent }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching liveEvent:", error);
      throw new Error("Failed to fetch liveEvent");
    });

    return liveEventFromAPI
  }),

  getLast5: publicProcedure
  .input(z.object({
    currentEvent: z.number().nullable()
  }))
  .query(async ({ input }) => {
    const { currentEvent } = input;
    if (!currentEvent) {
      return null;
    }

    const last5Queries= [1, 2, 3, 4, 5].map((n: number) =>
      axios.get(BASE_API_URL + `/live-event/${currentEvent - n}`, {
      headers: {}
    })
    .then((resp: { data: LiveEvent }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching liveEvent:", error);
      throw new Error("Failed to fetch liveEvent");
    }))

    const last5 = await Promise.all(last5Queries);

    return last5
  }),



});
