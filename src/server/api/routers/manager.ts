/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { z } from "zod";
import axios from "axios"

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { BASE_API_URL } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import type { ManagerHistory } from "@/lib/manager-history-type";

export type ManagerFromAPI = {
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

  linkManager: protectedProcedure
  .input(z.object({
    userId: z.string(), // Ensure userId
    managerId: z.string(),
    player_first_name: z.string(),
    player_last_name: z.string(),
    entry_name: z.string(),
  })) // Ensure id
  .mutation(async ({ ctx, input }) => {
    const { db } = ctx;
    const { userId, managerId, player_first_name, player_last_name, entry_name } = input;
    // check user ID exists in the database
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    // check if manager already exists in the database

    const manager = await db.manager.create({
      data: {
        userId,
        managerId,
        player_first_name,
        player_last_name,
        entry_name,
        createdById: userId, // or set this to the appropriate user id
      },
      select: {
        id: true,
        userId: true,
        managerId: true,
        player_first_name: true,
        player_last_name: true,
        entry_name: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!manager) {
      throw new Error("Failed to create manager mapping");
    }

    // update user with managerId
    const userLinked = await db.user.update({
      where: { id: userId },
      data: {
        manager: {
          connect: { id: manager.id },
        },
      },
    });

    return userLinked;
  }),

  unlinkManager: protectedProcedure
  .input(z.object({
    userId: z.string(), // Ensure userId
    managerId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { db } = ctx;
    const { userId, managerId } = input;

    // check user ID exists in the database
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    // check if manager exists in the database
    const manager = await db.manager.findUnique({
      where: { id: managerId },
    });
    if (!manager) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Manager not found" });
    }


    await db.manager.delete({
      where: { id: managerId },
    });
    // unlink manager from user
    const userUnlinked = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,

      }
    });

    return userUnlinked;
  }),


  fetchManagerHistory: protectedProcedure
  .input(z.object({
    managerId: z.string().nullable()
  }))
  .query(async ({ input }) => {
    const { managerId } = input;
    if (!managerId) {
      return null;
    }

    const managerHistory = await axios.get(BASE_API_URL + "/manager/" + managerId + "/history", {
      headers: {}
    })
    .then((resp: { data: ManagerHistory }) =>  resp.data)
    .catch((error) => {
      console.error("Error fetching manager data:", error);
      throw new Error("Failed to fetch manager data");
    });

    return managerHistory

  })

});
