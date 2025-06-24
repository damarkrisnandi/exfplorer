import { z } from "zod";
import axios from "axios"

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { BASE_API_URL } from "@/lib/utils";

type ManagerFromAPI = {
  id: number;
  joined_time: string;
  started_event: number;
  favourite_team: number | null;
  player_first_name: string;
  player_last_name: string;
  player_region_id: number;
  player_region_name: string;
  player_region_iso_code_short: string;
  player_region_iso_code_long: string;
  years_active: number;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  name: string;

};
export const managerRouter = createTRPCRouter({
  fetchManagerFromAPI: protectedProcedure
  .input(z.object({ id: z.string() })) // Ensure id
  .mutation(async ({ input }) => {
    const managerFromAPI = await axios.get(BASE_API_URL + "/manager/" + input.id, {
      headers: {}
    })
    .then((resp: { data: ManagerFromAPI }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching manager data:", error);
      throw new Error("Failed to fetch manager data");
    });

    return managerFromAPI
  }),

  mappingManager: protectedProcedure
  .input(z.object({
    userId: z.string(), // Ensure userId
    managerId: z.string(),
    player_first_name: z.string(),
    player_last_name: z.string(),
    entry_name: z.string(),
  })) // Ensure id
  .mutation(async ({ input }) => {

    return {}
  }),

});
