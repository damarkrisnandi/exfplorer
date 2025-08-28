'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Search, ArrowRight } from "lucide-react"
import type { Element, Team, Bootstrap } from "@/lib/bootstrap-type"
import type { PlayerPicked, PickData } from "@/server/api/routers/squad-pick"

type PlayerTransferModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPlayer: PlayerPicked | null
  bootstrap: Bootstrap
  onTransfer: (outPlayer: PlayerPicked, inPlayer: Element) => void
  currentSquad: PickData
}

export default function PlayerTransferModal({
  open,
  onOpenChange,
  selectedPlayer,
  bootstrap,
  onTransfer,
  currentSquad
}: PlayerTransferModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [teamFilter, setTeamFilter] = useState<number | null>(null)
  const [priceFilter, setPriceFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<'price' | 'points' | 'form' | 'selected'>('points')
  const [activeTab, setActiveTab] = useState<'all' | 'value' | 'form'>('all')

  useEffect(() => {
    if (open) {
      setSearchTerm("")
      setTeamFilter(null)
      setPriceFilter("")
      setSortBy('points')
      setActiveTab('all')
    }
  }, [open])

  if (!selectedPlayer || !bootstrap) return null

  // Get current squad element IDs to exclude
  const currentSquadIds = currentSquad.picks.map(pick => pick.element)

  // Filter players by position
  const playersOfSamePosition = bootstrap.elements.filter((player: Element) =>
    player.element_type === selectedPlayer.element_type &&
    !currentSquadIds.includes(player.id)
  )

  // Apply filters
  let filteredPlayers = playersOfSamePosition.filter((player: Element) => {
    const matchesSearch = player.web_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.second_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTeam = teamFilter ? player.team === teamFilter : true

    const matchesPrice = !priceFilter ||
      (priceFilter === 'under5' && player.now_cost < 50) ||
      (priceFilter === '5-7' && player.now_cost >= 50 && player.now_cost < 70) ||
      (priceFilter === '7-10' && player.now_cost >= 70 && player.now_cost < 100) ||
      (priceFilter === 'over10' && player.now_cost >= 100)

    return matchesSearch && matchesTeam && matchesPrice
  })

  // Apply sorting
  filteredPlayers = filteredPlayers.sort((a: Element, b: Element) => {
    switch (sortBy) {
      case 'price':
        return b.now_cost - a.now_cost
      case 'points':
        return b.total_points - a.total_points
      case 'form':
        return parseFloat(b.form) - parseFloat(a.form)
      case 'selected':
        return parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent)
      default:
        return 0
    }
  })

  // Filter by tabs
  if (activeTab === 'value') {
    const currentPlayerCost = bootstrap.elements.find((el: Element) => el.id === selectedPlayer.element)?.now_cost ?? 0
    filteredPlayers = filteredPlayers.filter((player: Element) =>
      player.now_cost <= currentPlayerCost
    )
  } else if (activeTab === 'form') {
    filteredPlayers = filteredPlayers.sort((a: Element, b: Element) => parseFloat(b.form) - parseFloat(a.form)).slice(0, 20)
  }

  const getPositionName = (elementType: number) => {
    switch (elementType) {
      case 1: return 'Goalkeeper'
      case 2: return 'Defender'
      case 3: return 'Midfielder'
      case 4: return 'Forward'
      default: return 'Player'
    }
  }

  const getTeamShortName = (teamId: number) => {
    return bootstrap.teams.find((team: Team) => team.id === teamId)?.short_name ?? 'UNK'
  }

  const handleTransfer = (inPlayer: Element) => {
    onTransfer(selectedPlayer, inPlayer)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Transfer {selectedPlayer.web_name}
            <Badge variant="outline">{getPositionName(selectedPlayer.element_type)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Search and Filters */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={teamFilter?.toString() ?? ""} onValueChange={(value) => setTeamFilter(value ? parseInt(value) : null)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All teams</SelectItem>
                  {bootstrap.teams.map((team: Team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.short_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All prices</SelectItem>
                  <SelectItem value="under5">Under £5.0m</SelectItem>
                  <SelectItem value="5-7">£5.0m - £7.0m</SelectItem>
                  <SelectItem value="7-10">£7.0m - £10.0m</SelectItem>
                  <SelectItem value="over10">Over £10.0m</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'price' | 'points' | 'form' | 'selected')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="selected">Ownership</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'value' | 'form')}>
              <TabsList>
                <TabsTrigger value="all">All Players ({filteredPlayers.length})</TabsTrigger>
                <TabsTrigger value="value">Value Picks</TabsTrigger>
                <TabsTrigger value="form">In Form</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                {/* Player List */}
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid gap-2">
                    {filteredPlayers.slice(0, 50).map((player: Element) => (
                      <Card key={player.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
                                  alt={player.web_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/pl-main-logo.png"
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{player.web_name}</div>
                                <div className="text-sm text-gray-600">
                                  {getTeamShortName(player.team)} • £{(player.now_cost / 10).toFixed(1)}m
                                </div>
                                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                  <span>Pts: {player.total_points}</span>
                                  <span>Form: {player.form}</span>
                                  <span>Own: {player.selected_by_percent}%</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleTransfer(player)}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <ArrowRight className="h-4 w-4" />
                              Transfer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
