'use client'

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Loader2, Zap, Target, TrendingUp, Users } from "lucide-react"
import type { Bootstrap } from "@/lib/bootstrap-type"
import type { PickData } from "@/server/api/routers/squad-pick"
import type { Fixture } from "@/lib/fixture-type"

type SquadOptimizerProps = {
  squadData: PickData
  bootstrap: Bootstrap
  fixtures: Fixture[]
  onOptimize: () => Promise<void>
  isOptimizing: boolean
}

export default function SquadOptimizer({
  squadData,
  bootstrap,
  fixtures: _fixtures,
  onOptimize,
  isOptimizing
}: SquadOptimizerProps) {
  const [objective, setObjective] = useState<'xp_o5' | 'total_points' | 'form'>('xp_o5')
  const [optimizationType, setOptimizationType] = useState<'starting_xi' | 'full_squad'>('starting_xi')

  // Get current squad statistics
  const currentSquadValue = squadData.picks.reduce((sum, pick) => {
    const element = bootstrap.elements.find(el => el.id === pick.element)
    return sum + (element?.now_cost ?? 0)
  }, 0)

  const currentSquadPoints = squadData.picks
    .filter(pick => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(pick.position))
    .reduce((sum, pick) => sum + (pick.event_points ?? 0), 0)

  const getTopPerformers = () => {
    return bootstrap.elements
      .filter(el => !squadData.picks.find(pick => pick.element === el.id))
      .sort((a, b) => (b.xp_o5 ?? 0) - (a.xp_o5 ?? 0))
      .slice(0, 5)
  }

  const getFormPlayers = () => {
    return bootstrap.elements
      .filter(el => !squadData.picks.find(pick => pick.element === el.id))
      .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
      .slice(0, 5)
  }

  const getPositionName = (elementType: number) => {
    switch (elementType) {
      case 1: return 'GKP'
      case 2: return 'DEF'
      case 3: return 'MID'
      case 4: return 'FWD'
      default: return 'PLAYER'
    }
  }

  const getTeamShortName = (teamId: number) => {
    return bootstrap.teams.find(team => team.id === teamId)?.short_name ?? 'UNK'
  }

  return (
    <div className="space-y-6">
      {/* Current Squad Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Squad Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">£{(currentSquadValue / 10).toFixed(1)}m</div>
              <div className="text-sm text-gray-600">Squad Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentSquadPoints}</div>
              <div className="text-sm text-gray-600">Starting XI Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold">£{(squadData.entry_history.bank / 10).toFixed(1)}m</div>
              <div className="text-sm text-gray-600">In Bank</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Objective</label>
              <Select value={objective} onValueChange={(value) => setObjective(value as typeof objective)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xp_o5">Expected Points (Form-based)</SelectItem>
                  <SelectItem value="total_points">Total Points (Season)</SelectItem>
                  <SelectItem value="form">Recent Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Scope</label>
              <Select value={optimizationType} onValueChange={(value) => setOptimizationType(value as typeof optimizationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starting_xi">Starting XI Only</SelectItem>
                  <SelectItem value="full_squad">Full Squad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Optimization Details</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Uses linear programming (yalps library) to find optimal squad</li>
              <li>• Respects FPL constraints: budget, formation, team limits</li>
              <li>• Maximizes {objective === 'xp_o5' ? 'expected points based on recent form' :
                                objective === 'total_points' ? 'total season points' : 'recent form metrics'}</li>
              <li>• {optimizationType === 'starting_xi' ? 'Optimizes starting XI selection from current squad' : 'Optimizes entire 15-man squad'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Tabs defaultValue="top-performers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          <TabsTrigger value="in-form">In Form</TabsTrigger>
        </TabsList>

        <TabsContent value="top-performers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Expected Points (Not in Squad)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTopPerformers().map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
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
                      <div>
                        <div className="font-medium">{player.web_name}</div>
                        <div className="text-sm text-gray-600">
                          {getTeamShortName(player.team)} • {getPositionName(player.element_type)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{(player.xp_o5 ?? 0).toFixed(2)} xP</div>
                      <div className="text-sm text-gray-600">£{(player.now_cost / 10).toFixed(1)}m</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-form">
          <Card>
            <CardHeader>
              <CardTitle>Players in Form (Not in Squad)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getFormPlayers().map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
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
                      <div>
                        <div className="font-medium">{player.web_name}</div>
                        <div className="text-sm text-gray-600">
                          {getTeamShortName(player.team)} • {getPositionName(player.element_type)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{player.form}</div>
                      <div className="text-sm text-gray-600">£{(player.now_cost / 10).toFixed(1)}m</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Optimize Button */}
      <div className="flex justify-center">
        <Button
          onClick={onOptimize}
          disabled={isOptimizing}
          size="lg"
          className="flex items-center gap-2"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Optimizing Squad...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Optimize Squad
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
