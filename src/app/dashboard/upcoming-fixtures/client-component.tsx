'use client'

import { useState, useEffect } from 'react'
import useBootstrapStore from "@/stores/bootstrap"
import { api } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export default function UpcomingFixturesClient() {
  const [isClient, setIsClient] = useState(false)
  const bootstrapStore = useBootstrapStore()
  const [countdown, setCountdown] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })

  // Fetch bootstrap data
  const { data: bootstrap, isLoading: bootstrapLoading } = api.bootstrap.get.useQuery()

  // Fetch fixtures data
  const { data: fixtures, isLoading: fixturesLoading } = api.fixtures.get.useQuery()

  // Store upcoming fixtures
  const [upcomingFixtures, setUpcomingFixtures] = useState<UpcomingFixture[]>([])

  useEffect(() => {
    setIsClient(true)

    // Set bootstrap in store if not already set
    if (bootstrap && !bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap)
    }
  }, [bootstrap, bootstrapStore])

  useEffect(() => {
    if (bootstrap?.events && bootstrap?.teams && fixtures) {
      // Get next event
      const nextEvent = bootstrap.events.find((e) => e.is_next)
      if (!nextEvent) {
        console.log("No next event found")
        return
      }

      // Get fixtures for next event
      const fixturesArray = Array.isArray(fixtures) ? fixtures : [fixtures]
      const nextEventFixtures = fixturesArray.filter((f: Fixture) =>
        f.event === nextEvent.id
      )

      // Process fixtures
      const processed: UpcomingFixture[] = nextEventFixtures.map(fixture => {
        // Get team information
        const homeTeam = bootstrap.teams.find((t) => t.id === fixture.team_h)
        const awayTeam = bootstrap.teams.find((t) => t.id === fixture.team_a)

        return {
          fixture,
          homeTeam,
          awayTeam,
          kickoffDate: fixture.kickoff_time ? new Date(fixture.kickoff_time) : new Date()
        }
      })

      // Sort by kickoff time
      processed.sort((a, b) => a.kickoffDate.getTime() - b.kickoffDate.getTime())

      setUpcomingFixtures(processed)
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

  // Format the date to display day, date and time in local timezone
  function formatKickoffTime(date: Date): string {
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isClient) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Upcoming Fixtures</span>
          {bootstrapStore.nextEvent && (
            <div className="flex gap-2 items-center">
              <Badge variant="outline">
                Gameweek {bootstrapStore.nextEvent.id}
              </Badge>
              <DeadlineCountdown deadlineTime={bootstrapStore.nextEvent.deadline_time}/>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bootstrapLoading || fixturesLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="ml-2">Loading fixtures...</div>
          </div>
        ) : !bootstrap || !fixtures || upcomingFixtures.length === 0 ? (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p>No upcoming fixtures available.</p>
          </div>
        ) : (          <div className="grid grid-cols-1 gap-4">
            {Object.entries(
              upcomingFixtures.reduce<Record<string, UpcomingFixture[]>>((groups, match) => {
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
                      className="p-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 text-right font-medium truncate">
                          {match.homeTeam?.short_name ?? 'TBD'}
                        </div>
                        <div className="mx-2 text-lg font-bold">vs</div>
                        <div className="flex-1 font-medium truncate">
                          {match.awayTeam?.short_name ?? 'TBD'}
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-500 mt-1">
                        {formatTimeOnly(match.kickoffDate)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
