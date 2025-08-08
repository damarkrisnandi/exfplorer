import { HydrateClient } from "@/trpc/server"
import LiveEventClient from "./client-component"
import { Suspense } from "react"

export default function LiveEventPage() {
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <LiveEventClient />
      </Suspense>
    </HydrateClient>
  )
}
