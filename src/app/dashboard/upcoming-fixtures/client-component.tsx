'use client'

import { useState, useEffect } from 'react'
import useBootstrapStore from "@/stores/bootstrap"
import { api } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { Fixture } from "@/lib/fixture-type"
import type { Team } from "@/lib/bootstrap-type"
import DeadlineCountdown from '@/components/deadline-countdown'

type UpcomingFixture = {
  fixture: Fixture
  homeTeam: Team | undefined
  awayTeam: Team | undefined
  kickoffDate: Date
}

export default function UpcomingFixturesClient() {
  const [isClient, setIsClient] = useState(false)
  const bootstrapStore = useBootstrapStore()

  // Fetch bootstrap data
  const { data: bootstrap, isLoading: bootstrapLoading } = api.bootstrap.get.useQuery()

  // Fetch fixtures data
  const { data: fixtures, isLoading: fixturesLoading } = api.fixtures.get.useQuery()

  // Store fixtures for different tabs
  const [currentGameweekFixtures, setCurrentGameweekFixtures] = useState<UpcomingFixture[]>([])
  const [nextGameweekFixtures, setNextGameweekFixtures] = useState<UpcomingFixture[]>([])
  const [activeTab, setActiveTab] = useState<string>('current')

  useEffect(() => {
    setIsClient(true)

    // Set bootstrap in store if not already set
    if (bootstrap && !bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap)
    }
  }, [bootstrap, bootstrapStore])

  useEffect(() => {
    if (bootstrap?.events && bootstrap?.teams && fixtures) {
      // Get current and next events
      const currentEvent = bootstrap.events.find((e) => e.is_current)
      const nextEvent = bootstrap.events.find((e) => e.is_next)
      
      const fixturesArray = Array.isArray(fixtures) ? fixtures : [fixtures]

      // Process current gameweek fixtures (current event or next event if no current)
      const targetCurrentEvent = currentEvent ?? nextEvent
      if (targetCurrentEvent) {
        const currentEventFixtures = fixturesArray.filter((f: Fixture) =>
          f.event === targetCurrentEvent.id
        )

        const processedCurrent: UpcomingFixture[] = currentEventFixtures.map(fixture => {
          const homeTeam = bootstrap.teams.find((t) => t.id === fixture.team_h)
          const awayTeam = bootstrap.teams.find((t) => t.id === fixture.team_a)

          return {
            fixture,
            homeTeam,
            awayTeam,
            kickoffDate: fixture.kickoff_time ? new Date(fixture.kickoff_time) : new Date()
          }
        })

        processedCurrent.sort((a, b) => a.kickoffDate.getTime() - b.kickoffDate.getTime())
        setCurrentGameweekFixtures(processedCurrent)
      }

      // Process next gameweek fixtures (only if we have a current event)
      if (currentEvent && nextEvent && nextEvent.id !== currentEvent.id) {
        const nextEventFixtures = fixturesArray.filter((f: Fixture) =>
          f.event === nextEvent.id
        )

        const processedNext: UpcomingFixture[] = nextEventFixtures.map(fixture => {
          const homeTeam = bootstrap.teams.find((t) => t.id === fixture.team_h)
          const awayTeam = bootstrap.teams.find((t) => t.id === fixture.team_a)

          return {
            fixture,
            homeTeam,
            awayTeam,
            kickoffDate: fixture.kickoff_time ? new Date(fixture.kickoff_time) : new Date()
          }
        })

        processedNext.sort((a, b) => a.kickoffDate.getTime() - b.kickoffDate.getTime())
        setNextGameweekFixtures(processedNext)
      } else if (!currentEvent && nextEvent) {
        // If there's no current event, find the event after next
        const nextEventIndex = bootstrap.events.findIndex(e => e.id === nextEvent.id)
        const futureEvent = bootstrap.events[nextEventIndex + 1]
        
        if (futureEvent) {
          const futureEventFixtures = fixturesArray.filter((f: Fixture) =>
            f.event === futureEvent.id
          )

          const processedFuture: UpcomingFixture[] = futureEventFixtures.map(fixture => {
            const homeTeam = bootstrap.teams.find((t) => t.id === fixture.team_h)
            const awayTeam = bootstrap.teams.find((t) => t.id === fixture.team_a)

            return {
              fixture,
              homeTeam,
              awayTeam,
              kickoffDate: fixture.kickoff_time ? new Date(fixture.kickoff_time) : new Date()
            }
          })

          processedFuture.sort((a, b) => a.kickoffDate.getTime() - b.kickoffDate.getTime())
          setNextGameweekFixtures(processedFuture)
        }
      }
    }
  }, [bootstrap, fixtures])
  // Format just the date part for grouping
  function formatDateForGrouping(date: Date): string {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format the time part only
  function formatTimeOnly(date: Date): string {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper function to render fixtures list
  const renderFixtures = (fixtures: UpcomingFixture[], showDeadline: boolean) => {
    if (fixtures.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p>No fixtures available.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {showDeadline && bootstrapStore.nextEvent && (
          <DeadlineCountdown className='space-y-2' deadlineTime={bootstrapStore.nextEvent.deadline_time} />
        )}
        {Object.entries(
          fixtures.reduce<Record<string, UpcomingFixture[]>>((groups, match) => {
            const dateKey = formatDateForGrouping(match.kickoffDate);
            groups[dateKey] ??= [];
            groups[dateKey].push(match);
            return groups;
          }, {})
        ).map(([dateKey, matches]) => (
          <div key={dateKey} className="space-y-2">
            <h3 className="font-medium text-gray-800 border-b pb-1">{dateKey}</h3>
            <div className="space-y-2">
              {matches.map((match) => (
                <div
                  key={match.fixture.id}
                  className={cn(
                    "p-3 border rounded-md transition-colors",
                    match.fixture.finished 
                      ? "bg-green-50 border-green-200" 
                      : match.fixture.started 
                        ? "bg-yellow-50 border-yellow-200" 
                        : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 text-right font-medium truncate">
                      {match.homeTeam?.short_name ?? 'TBD'}
                    </div>
                    <div className="mx-3 text-center">
                      {match.fixture.finished ? (
                        <div className="text-lg font-bold">
                          {match.fixture.team_h_score} - {match.fixture.team_a_score}
                        </div>
                      ) : match.fixture.started ? (
                        <div className="text-sm">
                          <div className="text-lg font-bold">
                            {match.fixture.team_h_score} - {match.fixture.team_a_score}
                          </div>
                          <div className="text-green-600 font-medium">
                            {match.fixture.minutes}&apos;
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-gray-400">vs</div>
                      )}
                    </div>
                    <div className="flex-1 font-medium truncate">
                      {match.awayTeam?.short_name ?? 'TBD'}
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-1">
                    {match.fixture.finished && (
                      <Badge variant="secondary" className="text-xs">FT</Badge>
                    )}
                    {match.fixture.started && !match.fixture.finished && (
                      <Badge variant="destructive" className="text-xs">LIVE</Badge>
                    )}
                    {!match.fixture.started && (
                      <span>{formatTimeOnly(match.kickoffDate)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!isClient) return null

  const currentEvent = bootstrap?.events.find((e) => e.is_current)
  const nextEvent = bootstrap?.events.find((e) => e.is_next)
  const targetCurrentEvent = currentEvent ?? nextEvent

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Fixtures</span>
          {targetCurrentEvent && (
            <Badge variant="outline">
              Gameweek {targetCurrentEvent.id}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bootstrapLoading || fixturesLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="ml-2">Loading fixtures...</div>
          </div>
        ) : !bootstrap || !fixtures ? (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p>No fixtures data available.</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">
                {currentEvent 
                  ? `Current GW${targetCurrentEvent?.id}` 
                  : `Upcoming GW${targetCurrentEvent?.id}`
                }
              </TabsTrigger>
              <TabsTrigger value="next">
                Next Gameweek
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="mt-4">
              {renderFixtures(currentGameweekFixtures, !currentEvent)}
            </TabsContent>
            
            <TabsContent value="next" className="mt-4">
              {nextGameweekFixtures.length > 0 ? (
                renderFixtures(nextGameweekFixtures, false)
              ) : (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <p>Next gameweek fixtures not available yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
