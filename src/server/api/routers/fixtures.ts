import axios from "axios"

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { BASE_API_URL } from "@/lib/utils";
import type { Fixture } from "@/lib/fixture-type";


export const fixturesRouter = createTRPCRouter({
  get: publicProcedure
  .query(async () => {    const fixturesFromAPI = await axios.get(BASE_API_URL + "/fixtures", {
      headers: {}
    })
    .then((resp: { data: Fixture[] }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching fixtures:", error);
      throw new Error("Failed to fetch fixtures");
    });

    return fixturesFromAPI
  }),



});
