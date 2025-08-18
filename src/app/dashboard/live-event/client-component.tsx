'use client'

import { useState, useEffect } from 'react'
import useBootstrapStore from "@/stores/bootstrap"
import { api } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"
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

type SortField = 'points' | 'minutes' | 'goals' | 'assists' | 'bonus' | 'bps' | 'name'
type SortDirection = 'asc' | 'desc'

export default function LiveEventClient() {
  const [isClient, setIsClient] = useState(false)
  const [sortField, setSortField] = useState<SortField>('points')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
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
  }  // Get player's position name
  const getPositionName = (elementType: number): string => {
    if (!bootstrap?.element_types) return ''
    const position = bootstrap.element_types.find(et => et.id === elementType)
    return position ? position.singular_name_short : ''
  }

  // Sort players function
  const sortPlayers = (players: (Element & { isHome: boolean })[]) => {
    return players.sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (sortField) {
        case 'points':
          aVal = a.event_points ?? 0
          bVal = b.event_points ?? 0
          break
        case 'minutes':
          aVal = a.minutes
          bVal = b.minutes
          break
        case 'goals':
          aVal = a.goals_scored
          bVal = b.goals_scored
          break
        case 'assists':
          aVal = a.assists
          bVal = b.assists
          break
        case 'bonus':
          aVal = a.bonus
          bVal = b.bonus
          break
        case 'bps':
          aVal = a.bps
          bVal = b.bps
          break
        case 'name':
          aVal = a.web_name
          bVal = b.web_name
          break
        default:
          aVal = a.event_points ?? 0
          bVal = b.event_points ?? 0
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }

      const numA = Number(aVal)
      const numB = Number(bVal)
      return sortDirection === 'desc' ? numB - numA : numA - numB
    })
  }

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Sort fixtures by status and kickoff time (keeping original function name for compatibility)
  const sortedFixturesOriginal = () => {
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
      <div className="mb-8 p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-4">Live Event Statistics</h1>
        <div className="text-sm opacity-90">
          Real-time player performance data with detailed statistics including goals, assists, cards, and bonus points.
        </div>
      </div>

      {bootstrapLoading || fixturesLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="ml-2">Loading data...</div>
        </div>
      ) : !bootstrap || !fixtures ? (
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p>Failed to load data. Please refresh the page.</p>
        </div>                      ) : sortedFixturesOriginal().length === 0 ? (
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p>No fixture data available for the current event.</p>
        </div>
      ) : (        <div className="grid grid-cols-1 gap-6">
          {/* Sorting Info */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Currently sorted by: <span className="font-semibold text-gray-900 capitalize">{sortField}</span> ({sortDirection === 'desc' ? 'Highest first' : 'Lowest first'})
              </div>              <div>
                Total players: <span className="font-semibold text-gray-900">
                  {sortedFixturesOriginal().reduce((total, group) =>
                    total + [...group.homePlayers, ...group.awayPlayers].filter(p => p.minutes >= 0).length, 0
                  )}
                </span>
                {' '}({sortedFixturesOriginal().reduce((total, group) =>
                    total + [...group.homePlayers, ...group.awayPlayers].filter(p => p.minutes > 0).length, 0
                  )} active)
              </div>
            </div>
          </div>

          {sortedFixturesOriginal().map((group) => (
            <Card key={`${group.fixture.team_h}_${group.fixture.team_a}`} className="overflow-hidden">              <CardHeader className={cn(
                "bg-gradient-to-r text-white",
                group.status === 'Live' ? "from-green-600 to-green-700 border-l-4 border-green-400" :
                group.status === 'Finished' ? "from-gray-600 to-gray-700 border-l-4 border-gray-400" :
                "from-yellow-600 to-yellow-700 border-l-4 border-yellow-400"
              )}>
                <div className="flex justify-between items-center">
                  <div className="flex-1 text-right">
                    <CardTitle className="text-lg">{group.homeTeam?.name}</CardTitle>
                    <div className="text-xs text-white/80 mt-1">
                      {group.homePlayers.filter(p => p.minutes > 0).length} active players
                    </div>
                  </div>
                  <div className="mx-6 flex flex-col items-center">
                    <Badge className={cn(
                      "mb-2",
                      group.status === 'Live' ? "bg-green-500 hover:bg-green-600" :
                      group.status === 'Finished' ? "bg-gray-500 hover:bg-gray-600" : "bg-yellow-500 hover:bg-yellow-600"
                    )}>
                      {group.status}
                    </Badge>
                    <div className="text-2xl font-bold">
                      {group.fixture.team_h_score ?? 0} - {group.fixture.team_a_score ?? 0}
                    </div>
                    <div className="text-xs text-white/80 mt-1 text-center">
                      {group.fixture.kickoff_time ? new Date(group.fixture.kickoff_time).toLocaleString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Time TBD'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.awayTeam?.name}</CardTitle>
                    <div className="text-xs text-white/80 mt-1">
                      {group.awayPlayers.filter(p => p.minutes > 0).length} active players
                    </div>
                  </div>
                </div>
              </CardHeader>              <CardContent className="p-0">
                {/* Match Summary */}
                <div className="p-4 bg-gray-50 border-b">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {[...group.homePlayers, ...group.awayPlayers].reduce((sum, p) => sum + p.goals_scored, 0)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Total Goals</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {[...group.homePlayers, ...group.awayPlayers].reduce((sum, p) => sum + p.assists, 0)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Total Assists</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-yellow-600">
                        {[...group.homePlayers, ...group.awayPlayers].reduce((sum, p) => sum + p.yellow_cards, 0)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Yellow Cards</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-red-600">
                        {[...group.homePlayers, ...group.awayPlayers].reduce((sum, p) => sum + p.red_cards, 0)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Red Cards</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {[...group.homePlayers, ...group.awayPlayers].reduce((sum, p) => sum + p.saves, 0)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Total Saves</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-indigo-600">
                        {[...group.homePlayers, ...group.awayPlayers].reduce((sum, p) => sum + (p.event_points || 0), 0)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Total FPL Pts</div>
                    </div>
                  </div>
                </div>                {/* Players List */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]"><thead className="bg-gray-50 border-b">
                      <tr>
                        <th
                          className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Player
                            {sortField === 'name' && (
                              sortDirection === 'desc' ? <TrendingDown size={14} /> : <TrendingUp size={14} />
                            )}
                            {sortField !== 'name' && <ArrowUpDown size={14} className="opacity-40" />}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Team</th>
                        <th
                          className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('minutes')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            Mins
                            {sortField === 'minutes' && (
                              sortDirection === 'desc' ? <TrendingDown size={14} /> : <TrendingUp size={14} />
                            )}
                            {sortField !== 'minutes' && <ArrowUpDown size={14} className="opacity-40" />}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('points')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            Pts
                            {sortField === 'points' && (
                              sortDirection === 'desc' ? <TrendingDown size={14} /> : <TrendingUp size={14} />
                            )}
                            {sortField !== 'points' && <ArrowUpDown size={14} className="opacity-40" />}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('goals')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            G
                            {sortField === 'goals' && (
                              sortDirection === 'desc' ? <TrendingDown size={14} /> : <TrendingUp size={14} />
                            )}
                            {sortField !== 'goals' && <ArrowUpDown size={14} className="opacity-40" />}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('assists')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            A
                            {sortField === 'assists' && (
                              sortDirection === 'desc' ? <TrendingDown size={14} /> : <TrendingUp size={14} />
                            )}
                            {sortField !== 'assists' && <ArrowUpDown size={14} className="opacity-40" />}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">YC</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">RC</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Saves</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">CS</th>
                        <th
                          className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('bonus')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            Bonus
                            {sortField === 'bonus' && (
                              sortDirection === 'desc' ? <TrendingDown size={14} /> : <TrendingUp size={14} />
                            )}
                            {sortField !== 'bonus' && <ArrowUpDown size={14} className="opacity-40" />}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('bps')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            BPS
                            {sortField === 'bps' && (
                              sortDirection === 'desc' ? <TrendingDown size={14} /> : <TrendingUp size={14} />
                            )}
                            {sortField !== 'bps' && <ArrowUpDown size={14} className="opacity-40" />}
                          </div>
                        </th>
                      </tr>
                    </thead>                    <tbody>                      {sortPlayers([...group.homePlayers.map(p => ({...p, isHome: true})), ...group.awayPlayers.map(p => ({...p, isHome: false}))])
                        .filter((player) => player.minutes > 0) // Show all players, including those with 0 minutes
                        .map((player, index) => (<tr key={player.id} className={cn(
                            "border-b hover:bg-gray-50 transition-colors",
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50",                            // Highlight top performers
                            (player.event_points ?? 0) >= 10 && "bg-green-50 hover:bg-green-100 border-green-200",
                            (player.event_points ?? 0) >= 15 && "bg-green-100 hover:bg-green-150 border-green-300",
                            // Highlight players who haven't played
                            player.minutes === 0 && "bg-gray-100 opacity-60"
                          )}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                  <img
                                    src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
                                    alt={player.web_name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "/pl-main-logo.png"
                                    }}
                                  />
                                </div>                                <div>
                                  <div className="font-medium text-sm">{player.web_name || 'Unknown'}</div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{player.first_name} {player.second_name}</span>
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {getPositionName(player.element_type)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium",
                                  player.isHome ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200"
                                )}
                              >
                                {player.isHome ? group.homeTeam?.short_name ?? 'H' : group.awayTeam?.short_name ?? 'A'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-medium">
                              {player.minutes > 0 ? player.minutes : (
                                <span className="text-gray-400 text-xs">Not played</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge
                                variant="default"
                                className={cn(
                                  "font-bold",
                                  (player.event_points || 0) >= 10 ? "bg-green-600" :
                                  (player.event_points || 0) >= 5 ? "bg-blue-600" :
                                  (player.event_points || 0) > 0 ? "bg-gray-600" :
                                  "bg-red-600"
                                )}
                              >
                                {player.event_points || 0}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {player.goals_scored > 0 ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {player.goals_scored}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {player.assists > 0 ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {player.assists}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {player.yellow_cards > 0 ? (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  {player.yellow_cards}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {player.red_cards > 0 ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  {player.red_cards}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {player.saves > 0 ? (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  {player.saves}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {player.clean_sheets > 0 ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  {player.clean_sheets}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {player.bonus > 0 ? (
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                  {player.bonus}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>                            <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                              {player.bps || '-'}
                            </td>
                          </tr>
                      ))}
                      {[...group.homePlayers, ...group.awayPlayers].filter((player) => player.minutes > 0).length === 0 && (
                        <tr>
                          <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                            No player data available for this fixture yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
