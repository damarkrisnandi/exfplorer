import { HydrateClient } from "@/trpc/server"
import PlayerStatsClient from "./client-component"
import { Suspense } from "react"

export default function PlayerStatsPage() {
  return (
    <HydrateClient>
      <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
        <PlayerStatsClient />
      </Suspense>
    </HydrateClient>
  )
}
