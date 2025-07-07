import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { managerRouter } from "./routers/manager";
import { pickRouter } from "./routers/squad-pick";
import { bootstrapRouter } from "./routers/bootstrap";
import { fixturesRouter } from "./routers/fixtures";
import { liveEventRouter } from "./routers/live-event";
import { referenceRouter } from "./routers/reference";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bootstrap: bootstrapRouter,
  fixtures: fixturesRouter,
  manager: managerRouter,
  pick: pickRouter,
  liveEvent: liveEventRouter,
  reference: referenceRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
