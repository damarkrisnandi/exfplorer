import { HydrateClient } from "@/trpc/server"
import UpcomingFixturesClient from "./client-component"
import { Suspense } from "react"

export default function UpcomingFixturesPage() {
  return (
    <HydrateClient>
      <Suspense fallback={<div className="flex justify-center items-center h-32">Loading...</div>}>
        <UpcomingFixturesClient />
      </Suspense>
    </HydrateClient>
  )
}
