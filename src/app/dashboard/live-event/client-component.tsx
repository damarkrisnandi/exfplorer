'use client'

import { useState, useEffect } from 'react'
import useBootstrapStore from "@/stores/bootstrap"
import { api } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ElementCard from "@/components/element-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { Fixture } from "@/lib/fixture-type"
import type { Element, Team } from "@/lib/bootstrap-type"

type FixtureGroup = {
  fixture: Fixture
  homeTeam: Team | undefined
  awayTeam: Team | undefined
  homePlayers: Element[]
  awayPlayers: Element[]
  status: 'Soon' | 'Live' | 'Finished'
}

export default function LiveEventClient() {
  const [isClient, setIsClient] = useState(false)
  const bootstrapStore = useBootstrapStore()

  // Fetch bootstrap data
  const { data: bootstrap, isLoading: bootstrapLoading } = api.bootstrap.get.useQuery()

  // Fetch fixtures data
  const { data: fixtures, isLoading: fixturesLoading } = api.fixtures.get.useQuery()

  // Group players by fixture
  const [fixtureGroups, setFixtureGroups] = useState<Record<string, FixtureGroup>>({})

  useEffect(() => {
    setIsClient(true)

    // Set bootstrap in store if not already set
    if (bootstrap && !bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap)
    }
  }, [bootstrap, bootstrapStore])

  useEffect(() => {
    if (bootstrap?.elements && bootstrap?.events && bootstrap?.teams && fixtures) {
      console.log("Processing data with:", {
        elementsCount: bootstrap.elements.length,
        teamsCount: bootstrap.teams.length,
        fixturesType: typeof fixtures,
        fixturesIsArray: Array.isArray(fixtures),
        fixturesLength: Array.isArray(fixtures) ? fixtures.length : 'Not an array'
      });

      // Get current event
      const currentEvent = bootstrap.events.find((e) => e.is_current)
      if (!currentEvent) {
        console.log("No current event found");
        return;
      }

      // Get fixtures for current event
      const fixturesArray = Array.isArray(fixtures) ? fixtures : [fixtures]
      const currentFixtures = fixturesArray.filter((f: Fixture) =>
        f.event === currentEvent.id
      )

      console.log("Filtered fixtures:", {
        currentEventId: currentEvent.id,
        currentFixturesCount: currentFixtures.length
      });

      // Group by fixture
      const groupedFixtures: Record<string, FixtureGroup> = {}

      bootstrap.elements.forEach(player => {
        const playerFixture = currentFixtures.find(
          (f: Fixture) => f.team_h === player.team || f.team_a === player.team
        )

        if (playerFixture) {
          const fixtureKey = `${playerFixture.team_h}_${playerFixture.team_a}`
          if (!groupedFixtures[fixtureKey]) {
            // Get team names
            const homeTeam = bootstrap.teams.find((t) => t.id === playerFixture.team_h)
            const awayTeam = bootstrap.teams.find((t) => t.id === playerFixture.team_a)

            groupedFixtures[fixtureKey] = {
              fixture: playerFixture,
              homeTeam,
              awayTeam,
              homePlayers: [],
              awayPlayers: [],
              status: getFixtureStatus(playerFixture)
            }
          }

          // Add player to appropriate team
          if (player.team === playerFixture.team_h) {
            groupedFixtures[fixtureKey].homePlayers.push(player)
          } else {
            groupedFixtures[fixtureKey].awayPlayers.push(player)
          }
        }
      })

      console.log("Grouped fixtures:", {
        groupCount: Object.keys(groupedFixtures).length
      });

      setFixtureGroups(groupedFixtures)
    }
  }, [bootstrap, fixtures])

  // Determine fixture status (soon/started/finished)
  function getFixtureStatus(fixture: Fixture): 'Soon' | 'Live' | 'Finished' {
    if (fixture.finished) return 'Finished'
    if (fixture.started) return 'Live'
    return 'Soon'
  }

  // Sort fixtures by status and kickoff time
  const sortedFixtures = () => {
    return Object.values(fixtureGroups).sort((a, b) => {
      // Sort by status priority: Live > Soon > Finished
      const statusOrder: Record<string, number> = {
        'Live': 0,
        'Soon': 1,
        'Finished': 2
      }

      // First sort by status
      const aStatus = a.status || 'Soon'
      const bStatus = b.status || 'Soon'
      // TypeScript safeguard for accessing statusOrder
      const aValue = statusOrder[aStatus] ?? 1
      const bValue = statusOrder[bStatus] ?? 1
      const statusDiff = aValue - bValue
      if (statusDiff !== 0) return statusDiff

      // Then sort by kickoff time
      return (a.fixture.kickoff_time || '').localeCompare(b.fixture.kickoff_time || '') || 0
    })
  }

  if (!isClient) return null

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Live Event</h1>

      {bootstrapLoading || fixturesLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="ml-2">Loading data...</div>
        </div>
      ) : !bootstrap || !fixtures ? (
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p>Failed to load data. Please refresh the page.</p>
        </div>
      ) : sortedFixtures().length === 0 ? (
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p>No fixture data available for the current event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedFixtures().map((group) => (
            <Card key={`${group.fixture.team_h}_${group.fixture.team_a}`} className="overflow-hidden">
              <CardHeader className={cn(
                "bg-gray-800 text-white",
                group.status === 'Live' ? "border-l-4 border-green-600" :
                group.status === 'Finished' ? "border-l-4 border-gray-600" :
                "border-l-4 border-yellow-600"
              )}>
                <div className="flex justify-between items-center">
                  <div className="flex-1 text-right">
                    <CardTitle>{group.homeTeam?.name}</CardTitle>
                  </div>
                  <div className="mx-4 flex flex-col items-center">
                    <Badge className={cn(
                      group.status === 'Live' ? "bg-green-600" :
                      group.status === 'Finished' ? "bg-gray-600" : "bg-yellow-600"
                    )}>
                      {group.status}
                    </Badge>
                    <div className="text-xl font-bold mt-1">
                      {group.fixture.team_h_score ?? 0} - {group.fixture.team_a_score ?? 0}
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {group.fixture.kickoff_time ? new Date(group.fixture.kickoff_time).toLocaleString() : 'Time TBD'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle>{group.awayTeam?.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <span className="w-4 h-4 inline-block mr-1 bg-gray-200 rounded-full"></span>
                      Home: {group.homeTeam?.name}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {group.homePlayers
                        .sort((a, b) => (b.event_points || 0) - (a.event_points || 0))
                        .filter((player) => player.minutes > 0)
                        .map((player) => (
                          <ElementCard
                            key={player.id}
                            photo={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
                            web_name={player.web_name || 'Unknown'}
                            event_points={player.event_points || 0}
                            is_captain={false}
                            is_vice_captain={false}
                            multiplier={1}
                            xp={0}
                            xp_current={0}
                            delta_xp={0}
                          />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <span className="w-4 h-4 inline-block mr-1 bg-gray-200 rounded-full"></span>
                      Away: {group.awayTeam?.name}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {group.awayPlayers
                        .sort((a, b) => (b.event_points || 0) - (a.event_points || 0))
                        .filter((player) => player.minutes > 0)
                        .map((player) => (
                          <ElementCard
                            key={player.id}
                            photo={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
                            web_name={player.web_name || 'Unknown'}
                            event_points={player.event_points || 0}
                            is_captain={false}
                            is_vice_captain={false}
                            multiplier={1}
                            xp={0}
                            xp_current={0}
                            delta_xp={0}
                          />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
