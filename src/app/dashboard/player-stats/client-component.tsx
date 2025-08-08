'use client'

import { useState, useEffect } from 'react'
import useBootstrapStore from "@/stores/bootstrap"
import { api } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2, Search, SortAsc, SortDesc } from "lucide-react"
import CountdownTimer from "@/components/countdown-timer"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SortDirection = 'asc' | 'desc'
type SortField = 'points' | 'cost' | 'selected' | 'xp' | 'form'

export default function PlayerStatsClient() {
  const [isClient, setIsClient] = useState(false)
  const bootstrapStore = useBootstrapStore()
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState<number | null>(null)
  const [teamFilter, setTeamFilter] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>('points')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Fetch bootstrap data
  const { data: bootstrap, isLoading: bootstrapLoading } = api.bootstrap.get.useQuery()

  useEffect(() => {
    setIsClient(true)

    // Set bootstrap in store if not already set
    if (bootstrap && !bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap)
    }
  }, [bootstrap, bootstrapStore])

  // Set up countdown timer to next event deadline
  useEffect(() => {
    if (bootstrapStore.nextEvent) {
      const updateCountdown = () => {
        const now = new Date().getTime()
        const deadline = new Date(bootstrapStore.nextEvent!.deadline_time).getTime()
        const distance = deadline - now

        if (distance > 0) {
          setCountdown({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          })
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        }
      }

      updateCountdown()
      const timer = setInterval(updateCountdown, 1000)
      return () => clearInterval(timer)
    }
  }, [bootstrapStore.nextEvent])

  // Filter and sort players
  const getFilteredPlayers = () => {
    if (!bootstrap?.elements) return []

    let filteredPlayers = bootstrap.elements

    // Apply position filter
    if (positionFilter !== null) {
      filteredPlayers = filteredPlayers.filter(player =>
        player.element_type === positionFilter
      )
    }

    // Apply team filter
    if (teamFilter !== null) {
      filteredPlayers = filteredPlayers.filter(player =>
        player.team === teamFilter
      )
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPlayers = filteredPlayers.filter(player =>
        player.web_name.toLowerCase().includes(searchLower) ||
        player.first_name.toLowerCase().includes(searchLower) ||
        player.second_name.toLowerCase().includes(searchLower)
      )
    }

    // Sort players
    return filteredPlayers.sort((a, b) => {
      let valueA, valueB

      switch (sortField) {
        case 'points':
          valueA = a.total_points
          valueB = b.total_points
          break
        case 'cost':
          valueA = a.now_cost
          valueB = b.now_cost
          break
        case 'selected':
          valueA = parseFloat(a.selected_by_percent)
          valueB = parseFloat(b.selected_by_percent)
          break
        case 'xp':
          valueA = a.xp ?? 0
          valueB = b.xp ?? 0
          break
        case 'form':
          valueA = parseFloat(a.form)
          valueB = parseFloat(b.form)
          break
        default:
          valueA = a.total_points
          valueB = b.total_points
      }

      return sortDirection === 'desc' ? valueB - valueA : valueA - valueB
    })
  }

  // Get player's position name
  const getPositionName = (elementType: number): string => {
    if (!bootstrap?.element_types) return ''
    const position = bootstrap.element_types.find(et => et.id === elementType)
    return position ? position.singular_name_short : ''
  }

  // Get player's team name and color
  const getTeamInfo = (teamId: number) => {
    if (!bootstrap?.teams) return { name: '', shortName: '' }
    const team = bootstrap.teams.find(t => t.id === teamId)
    return {
      name: team?.name ?? '',
      shortName: team?.short_name ?? ''
    }
  }

  // Toggle sort direction or change sort field
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  if (!isClient) return null

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-4">Player Statistics</h1>

        {bootstrapStore.nextEvent && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Gameweek {bootstrapStore.nextEvent.id} Deadline</h2>
            <p className="text-sm mb-4">{new Date(bootstrapStore.nextEvent.deadline_time).toLocaleString()}</p>
            <CountdownTimer
              initialDays={countdown.days}
              initialHours={countdown.hours}
              initialMinutes={countdown.minutes}
              initialSeconds={countdown.seconds}
            />
          </div>
        )}
      </div>

      {bootstrapLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="ml-2">Loading player data...</div>
        </div>
      ) : !bootstrap ? (
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p>Failed to load data. Please refresh the page.</p>
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search players..."
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                    onChange={(e) => setPositionFilter(e.target.value ? parseInt(e.target.value) : null)}
                    value={positionFilter ?? ''}
                  >
                    <option value="">All Positions</option>
                    {bootstrap.element_types.map(position => (
                      <option key={position.id} value={position.id}>
                        {position.singular_name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                    onChange={(e) => setTeamFilter(e.target.value ? parseInt(e.target.value) : null)}
                    value={teamFilter ?? ''}
                  >
                    <option value="">All Teams</option>
                    {bootstrap.teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={sortField === 'points' ? 'default' : 'outline'}
              onClick={() => toggleSort('points')}
              className="flex items-center gap-1"
            >
              Points {sortField === 'points' && (
                sortDirection === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />
              )}
            </Button>
            <Button
              size="sm"
              variant={sortField === 'cost' ? 'default' : 'outline'}
              onClick={() => toggleSort('cost')}
              className="flex items-center gap-1"
            >
              Cost {sortField === 'cost' && (
                sortDirection === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />
              )}
            </Button>
            <Button
              size="sm"
              variant={sortField === 'form' ? 'default' : 'outline'}
              onClick={() => toggleSort('form')}
              className="flex items-center gap-1"
            >
              Form {sortField === 'form' && (
                sortDirection === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />
              )}
            </Button>
            <Button
              size="sm"
              variant={sortField === 'selected' ? 'default' : 'outline'}
              onClick={() => toggleSort('selected')}
              className="flex items-center gap-1"
            >
              Selected {sortField === 'selected' && (
                sortDirection === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />
              )}
            </Button>
            <Button
              size="sm"
              variant={sortField === 'xp' ? 'default' : 'outline'}
              onClick={() => toggleSort('xp')}
              className="flex items-center gap-1"
            >
              Expected {sortField === 'xp' && (
                sortDirection === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {getFilteredPlayers().map(player => (
              <Card key={player.id} className={cn("overflow-hidden hover:shadow-lg transition-shadow")}>
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img
                    src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
                    alt={player.web_name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/pl-main-logo.png"
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {getPositionName(player.element_type)}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-600 text-xs">
                      £{(player.now_cost / 10).toFixed(1)}m
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-3 pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-bold">{player.web_name}</CardTitle>
                      <p className="text-xs text-gray-500">{getTeamInfo(player.team).name}</p>
                    </div>
                    <Badge variant="outline" className="text-lg font-bold">
                      {player.total_points}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Form</p>
                      <p className="font-medium">{player.form}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">xP</p>
                      <p className="font-medium">{player.xp?.toFixed(1) ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Selected</p>
                      <p className="font-medium">{player.selected_by_percent}%</p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Goals</p>
                      <p className="font-medium">{player.goals_scored}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assists</p>
                      <p className="font-medium">{player.assists}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredPlayers().length === 0 && (
            <div className="text-center p-6 bg-gray-100 rounded-lg">
              <p>No players match your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
