import axios from "axios"

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { BASE_API_URL } from "@/lib/utils";
import type { Bootstrap } from "@/lib/bootstrap-type";

export const bootstrapRouter = createTRPCRouter({
  get: publicProcedure
  .query(async () => {
    const bootstrapFromAPI = await axios.get(BASE_API_URL + "/bootstrap-static", {
      headers: {}
    })
    .then((resp: { data: Bootstrap }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching manager data:", error);
      throw new Error("Failed to fetch manager data");
    });

    return bootstrapFromAPI
  }),

});
