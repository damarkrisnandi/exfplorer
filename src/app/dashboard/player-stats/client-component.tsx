'use client'

import { useState, useEffect, Fragment } from 'react'
import type { KeyboardEvent } from 'react'
import useBootstrapStore from "@/stores/bootstrap"
import { api } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2, Search, SortAsc, SortDesc, LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type SortDirection = 'asc' | 'desc'
type SortField = 'points' | 'cost' | 'selected' | 'xp' | 'form'
type ViewMode = 'card' | 'list'
type ItemsPerPageOption = 10 | 20 | 50 | 100

export default function PlayerStatsClient() {  const [isClient, setIsClient] = useState(false)
  const bootstrapStore = useBootstrapStore()
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState<number | null>(null)
  const [teamFilter, setTeamFilter] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>('points')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('card')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPageOption>(20)

  // Fetch bootstrap data
  const { data: bootstrap, isLoading: bootstrapLoading } = api.bootstrap.get.useQuery()
  useEffect(() => {
    setIsClient(true)

    // Set bootstrap in store if not already set
    if (bootstrap && !bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap)
    }
  }, [bootstrap, bootstrapStore])
  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [positionFilter, teamFilter, search, sortField, sortDirection, itemsPerPage])
  // Set up countdown timer to next event deadline
  useEffect(() => {
    if (bootstrapStore.nextEvent) {
      // Removed countdown code since it's not used anymore
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
          valueA = a.xp_o5 ?? 0
          valueB = b.xp_o5 ?? 0
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

  // Get paginated players
  const getPaginatedPlayers = () => {
    const filteredPlayers = getFilteredPlayers()
    const totalPlayers = filteredPlayers.length
    const totalPages = Math.ceil(totalPlayers / itemsPerPage)

    // Reset to page 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalPlayers)

    return {
      players: filteredPlayers.slice(startIndex, endIndex),
      totalPlayers,
      totalPages,
      currentPage
    }
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
        <>          <Card className="mb-6">
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
                <div className="flex gap-2 items-center">
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
                  <Separator orientation="vertical" className="h-8" />                  <div className="flex gap-1 border border-gray-300 rounded-md p-1" role="group" aria-label="View mode toggle">
                    <Button
                      size="sm"
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('card')}
                      className="flex items-center gap-1"
                      aria-label="Card view"
                      aria-pressed={viewMode === 'card'}
                      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                        // Left/right arrows to switch between buttons
                        if (e.key === 'ArrowRight' && viewMode === 'card') {
                          e.preventDefault();
                          setViewMode('list');
                        }
                      }}
                    >
                      <LayoutGrid size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                      className="flex items-center gap-1"
                      aria-label="List view"
                      aria-pressed={viewMode === 'list'}
                      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                        // Left/right arrows to switch between buttons
                        if (e.key === 'ArrowLeft' && viewMode === 'list') {
                          e.preventDefault();
                          setViewMode('card');
                        }
                      }}
                    >
                      <List size={16} />
                    </Button>
                  </div>
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
            </Button>          </div>

          {/* Players Grid or List View */}
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {getPaginatedPlayers().players.map(player => (
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
                        <p className="font-medium">{player.xp_o5?.toFixed(1) ?? '-'}</p>
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Player</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Team</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Pos</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Price</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      <span className={cn(
                        "cursor-pointer",
                        sortField === 'points' ? "text-blue-600 font-bold" : ""
                      )}
                      onClick={() => toggleSort('points')}>
                        Points
                        {sortField === 'points' && (
                          sortDirection === 'desc' ? <SortDesc size={16} className="inline ml-1" /> : <SortAsc size={16} className="inline ml-1" />
                        )}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      <span className={cn(
                        "cursor-pointer",
                        sortField === 'form' ? "text-blue-600 font-bold" : ""
                      )}
                      onClick={() => toggleSort('form')}>
                        Form
                        {sortField === 'form' && (
                          sortDirection === 'desc' ? <SortDesc size={16} className="inline ml-1" /> : <SortAsc size={16} className="inline ml-1" />
                        )}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      <span className={cn(
                        "cursor-pointer",
                        sortField === 'xp' ? "text-blue-600 font-bold" : ""
                      )}
                      onClick={() => toggleSort('xp')}>
                        xP
                        {sortField === 'xp' && (
                          sortDirection === 'desc' ? <SortDesc size={16} className="inline ml-1" /> : <SortAsc size={16} className="inline ml-1" />
                        )}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      <span className={cn(
                        "cursor-pointer",
                        sortField === 'selected' ? "text-blue-600 font-bold" : ""
                      )}
                      onClick={() => toggleSort('selected')}>
                        Selected %
                        {sortField === 'selected' && (
                          sortDirection === 'desc' ? <SortDesc size={16} className="inline ml-1" /> : <SortAsc size={16} className="inline ml-1" />
                        )}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">G</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">A</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedPlayers().players.map((player, index) => (
                    <tr key={player.id} className={cn(
                      "border-b hover:bg-gray-50 transition-colors",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    )}>
                      <td className="px-4 py-3 text-sm">
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
                          </div>
                          <div>
                            <div className="font-medium">{player.web_name}</div>
                            <div className="text-xs text-gray-500">{player.first_name} {player.second_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{getTeamInfo(player.team).shortName}</td>
                      <td className="px-4 py-3 text-sm text-center">{getPositionName(player.element_type)}</td>
                      <td className="px-4 py-3 text-sm text-center">£{(player.now_cost / 10).toFixed(1)}m</td>
                      <td className="px-4 py-3 text-sm font-bold text-center">{player.total_points}</td>
                      <td className="px-4 py-3 text-sm text-center">{player.form}</td>
                      <td className="px-4 py-3 text-sm text-center">{player.xp_o5?.toFixed(1) ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-center">{player.selected_by_percent}%</td>
                      <td className="px-4 py-3 text-sm text-center">{player.goals_scored}</td>
                      <td className="px-4 py-3 text-sm text-center">{player.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}          {/* Pagination */}
          {getPaginatedPlayers().totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 border-t pt-4 gap-4">
              <div className="text-sm text-gray-500 flex items-center gap-3">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, getPaginatedPlayers().totalPlayers)} of {getPaginatedPlayers().totalPlayers} players
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Show:</span>                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value: string) => setItemsPerPage(parseInt(value) as ItemsPerPageOption)}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder="20" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-1"
                   role="navigation"
                   aria-label="Pagination">                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                    if (e.key === 'Home') {
                      e.preventDefault();
                      setCurrentPage(1);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: getPaginatedPlayers().totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show current page, first page, last page, and pages around current page
                    const totalPages = getPaginatedPlayers().totalPages;
                    return page === 1 || page === totalPages ||
                           (page >= currentPage - 1 && page <= currentPage + 1);
                  })
                  .map((page, i, arr) => {
                    // Add ellipsis if there are skipped pages
                    const showEllipsisBefore = i > 0 && arr[i - 1] !== page - 1;
                    const showEllipsisAfter = i < arr.length - 1 && arr[i + 1] !== page + 1;
                    return (
                      <Fragment key={page}>
                        {showEllipsisBefore && (
                          <Button variant="outline" size="sm" disabled className="px-3">
                            ...
                          </Button>
                        )}                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="px-3"
                          aria-label={`Page ${page}`}
                          aria-current={currentPage === page ? "page" : undefined}
                          onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                            // Arrow navigation for keyboard users
                            if (e.key === 'ArrowLeft' && page > 1) {
                              e.preventDefault();
                              setCurrentPage(prev => Math.max(prev - 1, 1));
                            } else if (e.key === 'ArrowRight' && page < getPaginatedPlayers().totalPages) {
                              e.preventDefault();
                              setCurrentPage(prev => Math.min(prev + 1, getPaginatedPlayers().totalPages));
                            } else if (e.key === 'Home') {
                              e.preventDefault();
                              setCurrentPage(1);
                            } else if (e.key === 'End') {
                              e.preventDefault();
                              setCurrentPage(getPaginatedPlayers().totalPages);
                            }
                          }}
                        >
                          {page}
                        </Button>
                        {showEllipsisAfter && (
                          <Button variant="outline" size="sm" disabled className="px-3">
                            ...
                          </Button>
                        )}
                      </Fragment>
                    );
                  })}                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, getPaginatedPlayers().totalPages))}
                  disabled={currentPage === getPaginatedPlayers().totalPages}
                  aria-label="Next page"
                  onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                    if (e.key === 'End') {
                      e.preventDefault();
                      setCurrentPage(getPaginatedPlayers().totalPages);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {getPaginatedPlayers().players.length === 0 && (
            <div className="text-center p-6 bg-gray-100 rounded-lg">
              <p>No players match your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
