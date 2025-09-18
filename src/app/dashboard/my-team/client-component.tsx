'use client'

import ElementCard from "@/components/element-card"
import SquadOptimizer from "@/components/squad-optimizer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PickData } from "@/server/api/routers/squad-pick"
import useBootstrapStore from "@/stores/bootstrap"
import { api } from "@/trpc/react"
import { Loader2, Shuffle, Zap } from "lucide-react"
import Image from 'next/image'
import { useEffect, useState } from 'react'

type MyTeamClientProps = {
  session: {
    user: {
      manager: {
        id: string
        managerId: string
        entry_name: string
        player_first_name: string
        player_last_name: string
      }
    }
  }
}

export default function MyTeamClient({ session }: MyTeamClientProps) {
  const [isClient, setIsClient] = useState(false)
  const [optimizerOpen, setOptimizerOpen] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [squadData, setSquadData] = useState<PickData | null>(null)

  const bootstrapStore = useBootstrapStore()

  // Fetch current squad data
  const { data: currentSquad, isLoading: squadLoading } = api.pick.getCurrentPickFromAPI.useQuery({
    managerId: session.user.manager.managerId,
    currentEvent: bootstrapStore.currentEvent?.id ?? null
  })

  const { data: optimizedSquad } = api.pick.getOptimizedPick.useQuery({
    managerId: session.user.manager.managerId,
    currentEvent: bootstrapStore.currentEvent?.id ?? null
  })

  // Fetch bootstrap data for player selection
  const { data: bootstrap, isLoading: bootstrapLoading } = api.bootstrap.get.useQuery()

  // Fetch fixtures data for optimization
  const { data: fixtures } = api.fixtures.get.useQuery()

  useEffect(() => {
    setIsClient(true)
    if (bootstrap && !bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap)
    }
  }, [bootstrap, bootstrapStore])

  useEffect(() => {
    if (currentSquad) {
      setSquadData(currentSquad)
    }
  }, [currentSquad])

  const handleSquadOptimization = async () => {
    if (!bootstrap || !fixtures || !squadData) return

    setIsOptimizing(true)
    try {
      if (optimizedSquad) {
        setSquadData(optimizedSquad)
      }
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsOptimizing(false)
      setOptimizerOpen(false)
    }
  }

  const handleSquadRefresh = async () => {
    if (!bootstrap || !fixtures || !squadData) return

    setIsOptimizing(true)
    try {
      if (currentSquad) {
        setSquadData(currentSquad)
      }
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsOptimizing(false)
      // setOptimizerOpen(true)
    }
  }

  if (!isClient || squadLoading || bootstrapLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="ml-2">Loading squad data...</div>
      </div>
    )
  }

  if (!squadData || !bootstrap) {
    return (
      <div className="text-center p-6 bg-gray-100 rounded-lg">
        <p>No squad data available</p>
      </div>
    )
  }

  const startingXI = squadData.picks?.filter(pick => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(pick.position)) ?? []
  const bench = squadData.picks?.filter(pick => [12, 13, 14, 15].includes(pick.position)) ?? []

  const gkp = startingXI.filter(pick => pick.element_type === 1)
  const def = startingXI.filter(pick => pick.element_type === 2)
  const mid = startingXI.filter(pick => pick.element_type === 3)
  const fwd = startingXI.filter(pick => pick.element_type === 4)

  const totalValue = currentSquad?.picks.reduce((sum, pick) => {
    const element = bootstrap.elements.find(el => el.id === pick.element)
    return sum + (element?.now_cost ?? 0)
  }, 0) ?? 0

  const totalPoints = squadData.picks.reduce((sum, pick) => sum + ((pick.xp_o5 ?? 0) * pick.multiplier), 0) ?? 0

  // Get transfer suggestions based on xp_o5 for 3-5 gameweeks with budget constraints
  const getTransferSuggestions = () => {
    if (!bootstrap || !squadData) return []

    const availableMoney = squadData.entry_history.bank

    type PlayerWithDetails = {
      id: number
      web_name: string
      now_cost: number
      xp_o5: number
      code: string
      element_type: number
      team: number
      position_name: string
      team_name: string
    }

    const suggestions: Array<{
      playerIn: PlayerWithDetails
      playerOut: PlayerWithDetails
      xpGain: number
      costDifference: number
      valueImprovement: number
    }> = []

    // Get current squad players with their details
    const currentPlayers = squadData.picks.map(pick => {
      const element = bootstrap.elements.find(el => el.id === pick.element)
      if (!element) return null

      return {
        ...pick,
        id: element.id,
        web_name: element.web_name,
        now_cost: element.now_cost,
        xp_o5: pick.xp_o5 ?? element.xp_o5 ?? 0,
        code: element.code.toString(),
        element_type: element.element_type,
        team: element.team,
        position_name: bootstrap.element_types.find(type => type.id === element.element_type)?.singular_name ?? 'Player',
        team_name: bootstrap.teams.find(team => team.id === element.team)?.short_name ?? 'UNK'
      }
    }).filter(Boolean)

    // For each position, find the best transfers
    const positions = [1, 2, 3, 4] // GKP, DEF, MID, FWD

    positions.forEach(positionType => {
      const currentPlayersInPosition = currentPlayers.filter(p => p && p.element_type === positionType)
      const availablePlayersInPosition = bootstrap.elements
        .filter(el => {
          const isNotInSquad = !squadData.picks.find(pick => pick.element === el.id)
          const isCorrectPosition = el.element_type === positionType
          const hasXpData = (el.xp_o5 ?? 0) > 0
          return isNotInSquad && isCorrectPosition && hasXpData
        })
        .sort((a, b) => (b.xp_o5 ?? 0) - (a.xp_o5 ?? 0))

      // For each player in current squad of this position, check if there's a better option within budget
      currentPlayersInPosition.forEach(currentPlayer => {
        if (!currentPlayer) return

        // Find the best affordable replacement
        const bestReplacement = availablePlayersInPosition.find(newPlayer => {
          const costDiff = (newPlayer.now_cost ?? 0) - (currentPlayer.now_cost ?? 0)
          const isAffordable = costDiff <= availableMoney
          const isBetter = (newPlayer.xp_o5 ?? 0) > (currentPlayer.xp_o5 ?? 0)
          return isAffordable && isBetter
        })

        if (bestReplacement) {
          const xpGain = (bestReplacement.xp_o5 ?? 0) - (currentPlayer.xp_o5 ?? 0)
          const costDifference = (bestReplacement.now_cost ?? 0) - (currentPlayer.now_cost ?? 0)
          const valueImprovement = xpGain / Math.max(0.1, bestReplacement.now_cost / 10) // XP per million

          suggestions.push({
            playerIn: {
              id: bestReplacement.id,
              web_name: bestReplacement.web_name,
              now_cost: bestReplacement.now_cost,
              xp_o5: bestReplacement.xp_o5 ?? 0,
              code: bestReplacement.code.toString(),
              element_type: bestReplacement.element_type,
              team: bestReplacement.team,
              position_name: bootstrap.element_types.find(type => type.id === bestReplacement.element_type)?.singular_name ?? 'Player',
              team_name: bootstrap.teams.find(team => team.id === bestReplacement.team)?.short_name ?? 'UNK'
            },
            playerOut: {
              id: currentPlayer.id,
              web_name: currentPlayer.web_name,
              now_cost: currentPlayer.now_cost,
              xp_o5: currentPlayer.xp_o5,
              code: currentPlayer.code,
              element_type: currentPlayer.element_type,
              team: currentPlayer.team,
              position_name: currentPlayer.position_name,
              team_name: currentPlayer.team_name
            },
            xpGain,
            costDifference,
            valueImprovement
          })
        }
      })
    })

    // Sort by XP gain and return top 5
    const topSuggestions = suggestions
      .sort((a, b) => b.xpGain - a.xpGain)
      .slice(0, 5)

    // If no suggestions found, try with a more relaxed criteria (just better players, ignore budget temporarily)
    if (topSuggestions.length === 0) {
      positions.forEach(positionType => {
        const currentPlayersInPosition = currentPlayers.filter(p => p && p.element_type === positionType)
        const availablePlayersInPosition = bootstrap.elements
          .filter(el => {
            const isNotInSquad = !squadData.picks.find(pick => pick.element === el.id)
            const isCorrectPosition = el.element_type === positionType
            const hasXpData = (el.xp_o5 ?? 0) > 0
            return isNotInSquad && isCorrectPosition && hasXpData
          })
          .sort((a, b) => (b.xp_o5 ?? 0) - (a.xp_o5 ?? 0))
          .slice(0, 3) // Top 3 in each position

        currentPlayersInPosition.forEach(currentPlayer => {
          if (!currentPlayer) return

          const worstInPosition = currentPlayersInPosition
            .sort((a, b) => (a?.xp_o5 ?? 0) - (b?.xp_o5 ?? 0))[0]

          if (currentPlayer === worstInPosition) {
            availablePlayersInPosition.forEach(newPlayer => {
              const costDiff = (newPlayer.now_cost ?? 0) - (currentPlayer.now_cost ?? 0)
              const isBetter = (newPlayer.xp_o5 ?? 0) > (currentPlayer.xp_o5 ?? 0)

              if (isBetter && suggestions.length < 3) {
                const xpGain = (newPlayer.xp_o5 ?? 0) - (currentPlayer.xp_o5 ?? 0)
                const valueImprovement = xpGain / Math.max(0.1, newPlayer.now_cost / 10)

                suggestions.push({
                  playerIn: {
                    id: newPlayer.id,
                    web_name: newPlayer.web_name,
                    now_cost: newPlayer.now_cost,
                    xp_o5: newPlayer.xp_o5 ?? 0,
                    code: newPlayer.code.toString(),
                    element_type: newPlayer.element_type,
                    team: newPlayer.team,
                    position_name: bootstrap.element_types.find(type => type.id === newPlayer.element_type)?.singular_name ?? 'Player',
                    team_name: bootstrap.teams.find(team => team.id === newPlayer.team)?.short_name ?? 'UNK'
                  },
                  playerOut: {
                    id: currentPlayer.id,
                    web_name: currentPlayer.web_name,
                    now_cost: currentPlayer.now_cost,
                    xp_o5: currentPlayer.xp_o5,
                    code: currentPlayer.code,
                    element_type: currentPlayer.element_type,
                    team: currentPlayer.team,
                    position_name: currentPlayer.position_name,
                    team_name: currentPlayer.team_name
                  },
                  xpGain,
                  costDifference: costDiff,
                  valueImprovement
                })
              }
            })
          }
        })
      })
    }

    return suggestions
      .sort((a, b) => b.xpGain - a.xpGain)
      .slice(0, 5)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with squad stats and controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">My Squad</CardTitle>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>Value: £{(totalValue / 10).toFixed(1)}m</span>
                <span>Total XP (3-5 GW): {totalPoints.toFixed(2)}</span>
                <span>Bank: £{((currentSquad?.entry_history.bank ?? 0) / 10).toFixed(1)}m</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSquadOptimization}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Optimize Squad
              </Button>

              <Button variant="outline" onClick={handleSquadRefresh}>
                <Shuffle className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Formation Display */}
      <Card>
        <CardContent className="p-6">
          <div
            className="bg-cover bg-center h-[60vh] w-full flex flex-col justify-center space-y-8 relative"
            style={{ backgroundImage: `url('/pitch-default.svg')` }}
          >
            {/* Goalkeeper */}
            <div className="flex justify-center">
              {gkp.map((pick) => (
                <ElementCard
                  key={pick.element}
                  web_name={pick.web_name}
                  photo={pick.photo}
                  event_points={pick.event_points ?? 0}
                  is_captain={pick.is_captain}
                  is_vice_captain={pick.is_vice_captain}
                  multiplier={pick.multiplier}
                  xp={pick.xp_o5 ?? 0}
                  xp_current={pick.xp_o5_current ?? 0}
                  delta_xp={pick.delta_xp ?? 0}
                  nextFixtures={pick.nextFixtures}
                />
              ))}
            </div>

            {/* Defenders */}
            <div className="flex justify-evenly items-center">
              {def.map((pick) => (
                <ElementCard
                  key={pick.element}
                  web_name={pick.web_name}
                  photo={pick.photo}
                  event_points={pick.event_points ?? 0}
                  is_captain={pick.is_captain}
                  is_vice_captain={pick.is_vice_captain}
                  multiplier={pick.multiplier}
                  xp={pick.xp_o5 ?? 0}
                  xp_current={pick.xp_o5_current ?? 0}
                  delta_xp={pick.delta_xp ?? 0}
                  nextFixtures={pick.nextFixtures}
                />
              ))}
            </div>

            {/* Midfielders */}
            <div className="flex justify-evenly items-center">
              {mid.map((pick) => (
                <ElementCard
                  key={pick.element}
                  web_name={pick.web_name}
                  photo={pick.photo}
                  event_points={pick.event_points ?? 0}
                  is_captain={pick.is_captain}
                  is_vice_captain={pick.is_vice_captain}
                  multiplier={pick.multiplier}
                  xp={pick.xp_o5 ?? 0}
                  xp_current={pick.xp_o5_current ?? 0}
                  delta_xp={pick.delta_xp ?? 0}
                  nextFixtures={pick.nextFixtures}
                />
              ))}
            </div>

            {/* Forwards */}
            <div className="flex justify-evenly items-center">
              {fwd.map((pick) => (
                <ElementCard
                  key={pick.element}
                  web_name={pick.web_name}
                  photo={pick.photo}
                  event_points={pick.event_points ?? 0}
                  is_captain={pick.is_captain}
                  is_vice_captain={pick.is_vice_captain}
                  multiplier={pick.multiplier}
                  xp={pick.xp_o5 ?? 0}
                  xp_current={pick.xp_o5_current ?? 0}
                  delta_xp={pick.delta_xp ?? 0}
                  nextFixtures={pick.nextFixtures}
                />
              ))}
            </div>
          </div>
          {/* Bench Divider */}
          <div className="relative flex items-center justify-center mt-8 mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative bg-white px-4">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                Bench
              </span>
            </div>
          </div>

          {/* Bench */}
          <div className="flex gap-4 justify-center">
            {bench.map((pick) => (
              <ElementCard
                key={pick.element}
                web_name={pick.web_name}
                photo={pick.photo}
                event_points={pick.event_points ?? 0}
                is_captain={pick.is_captain}
                is_vice_captain={pick.is_vice_captain}
                multiplier={pick.multiplier}
                xp={pick.xp_o5 ?? 0}
                xp_current={pick.xp_o5_current ?? 0}
                delta_xp={pick.delta_xp ?? 0}
                nextFixtures={pick.nextFixtures}
              />
            ))}
          </div>

        </CardContent>
      </Card>

      {/* Bench */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bench</CardTitle>
        </CardHeader>
        <CardContent>

        </CardContent>
      </Card> */}


      {/* Transfer Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Smart Transfer Suggestions (Budget-Aware)</CardTitle>
          <p className="text-sm text-gray-600">
            Available budget: £{(squadData.entry_history.bank / 10).toFixed(1)}m
          </p>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-2">
            <p>Squad players with xP_o5 data: {squadData.picks.filter(p => (p.xp_o5 ?? 0) > 0).length} / {squadData.picks.length}</p>
            <p>Available players with xP_o5 data: {bootstrap.elements.filter(el =>
              !squadData.picks.find(pick => pick.element === el.id) && (el.xp_o5 ?? 0) > 0
            ).length}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTransferSuggestions().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No profitable transfers available within your budget.</p>
                <p className="text-sm">Consider saving for next gameweek or using a wildcard.</p>
                <div className="mt-4 text-xs">
                  <p>Debug: Checking {bootstrap.elements.filter(el => !squadData.picks.find(pick => pick.element === el.id)).length} available players</p>
                  <p>Budget: £{(squadData.entry_history.bank / 10).toFixed(1)}m</p>
                </div>
              </div>
            ) : (
              getTransferSuggestions().map((suggestion, index) => {
                const isAffordable = suggestion.costDifference <= squadData.entry_history.bank
                return (
                  <div key={index} className={`p-4 rounded-lg border ${isAffordable
                    ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                    : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-green-700">
                        +{suggestion.xpGain.toFixed(2)} XP Gain
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isAffordable ? 'text-blue-700' : 'text-red-700'
                          }`}>
                          {suggestion.costDifference >= 0 ? '+' : ''}£{(suggestion.costDifference / 10).toFixed(1)}m
                        </span>
                        {!isAffordable && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Need £{((suggestion.costDifference - squadData.entry_history.bank) / 10).toFixed(1)}m more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Player Out */}
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-red-600 font-bold text-sm">OUT</div>
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${suggestion.playerOut.code}.png`}
                            alt={suggestion.playerOut.web_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Fallback to default image
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{suggestion.playerOut.web_name}</div>
                          <div className="text-xs text-gray-600">
                            {suggestion.playerOut.team_name} • {suggestion.playerOut.position_name}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-red-600">{(suggestion.playerOut.xp_o5 ?? 0).toFixed(2)} xP</span>
                            <span className="text-xs text-gray-500">£{(suggestion.playerOut.now_cost / 10).toFixed(1)}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Player In */}
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-green-600 font-bold text-sm">IN</div>
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${suggestion.playerIn.code}.png`}
                            alt={suggestion.playerIn.web_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Fallback to default image
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{suggestion.playerIn.web_name}</div>
                          <div className="text-xs text-gray-600">
                            {suggestion.playerIn.team_name} • {suggestion.playerIn.position_name}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm font-bold text-green-600">{(suggestion.playerIn.xp_o5 ?? 0).toFixed(2)} xP</span>
                            <span className="text-xs text-gray-500">£{(suggestion.playerIn.now_cost / 10).toFixed(1)}m</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transfer Summary */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Value Rating:</span>
                        <span className="font-semibold text-blue-600">{suggestion.valueImprovement.toFixed(2)} xP/£m</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Remaining Budget:</span>
                        <span className="font-semibold">£{((squadData.entry_history.bank - suggestion.costDifference) / 10).toFixed(1)}m</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Squad Optimizer Modal */}
      {optimizerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Squad Optimizer</h2>
                <Button
                  variant="outline"
                  onClick={() => setOptimizerOpen(false)}
                >
                  Close
                </Button>
              </div>
              <SquadOptimizer
                squadData={squadData}
                bootstrap={bootstrap}
                fixtures={fixtures ?? []}
                onOptimize={handleSquadOptimization}
                isOptimizing={isOptimizing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
