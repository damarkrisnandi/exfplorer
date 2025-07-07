import type { Bootstrap } from "./bootstrap-type"
import type { Fixture } from "./fixture-type"
import type { LiveEvent } from "./live-event-type"

export type Reference = {
  bootstrap: Bootstrap | null,
  fixtures: Fixture[],
  bootstrapHistory: Bootstrap | null,
  fixturesHistory: Fixture[],
  liveEvents: LiveEvent[],
}
