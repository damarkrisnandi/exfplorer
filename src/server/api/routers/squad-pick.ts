import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { BASE_API_URL, getElementPhotoUrl } from "@/lib/utils";
import axios from "axios";

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
    const response = await axios.get(BASE_API_URL + `/picks/${managerId}/${currentEvent}`, {
          headers: {}
    })
    .then((resp: { data: PickData }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data");
    });

    const responseElements = await axios.get(BASE_API_URL + `/bootstrap-static`, {
          headers: {}
    })
    .then((resp: { data: { elements: {
      photo: string;
      web_name: string,
      id: number,
      event_points: number
    }[]} }) =>  resp.data.elements)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data");
    });

    const finalData: PickData = {
      ...response,
      picks: response.picks.map((pick: PlayerPicked) => {
        const found = responseElements.find((data: { id: number }) => data.id === pick.element);
        return {
          ...pick,
          web_name: found ? found.web_name : undefined,
          photo: found ? getElementPhotoUrl(found.photo ?? "") : undefined,
          event_points: found ? found.event_points : 0
        };
      }),

    }
    return finalData
  })
})
