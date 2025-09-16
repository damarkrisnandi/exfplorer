'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { api } from "@/trpc/react"
import useBootstrapStore from "@/stores/bootstrap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Shuffle, Zap } from "lucide-react"
import type { PickData } from "@/server/api/routers/squad-pick"
import ElementCard from "@/components/element-card"
import SquadOptimizer from "@/components/squad-optimizer"
import { optimizationProcess } from "@/lib/optimization"

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
  const { data: currentSquad, isLoading: squadLoading, refetch: refetchSquad } = api.pick.getCurrentPickFromAPI.useQuery({
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
      // Use the existing optimization process
      const optimizedSquad = optimizationProcess({
        bootstrap,
        bootstrapHistory: bootstrap, // Using same bootstrap as history for now
        fixtures,
        fixturesHistory: fixtures,
        picksData: squadData,
      })

      setSquadData(optimizedSquad)
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsOptimizing(false)
      setOptimizerOpen(false)
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

  const totalValue = squadData.picks.reduce((sum, pick) => {
    const element = bootstrap.elements.find(el => el.id === pick.element)
    return sum + (element?.now_cost ?? 0)
  }, 0)

  const totalPoints = squadData.picks.reduce((sum, pick) => sum + (pick.xp_o5 ?? 0), 0)

  // Get transfer suggestions based on xp_o5 for 3-5 gameweeks
  const getTransferSuggestions = () => {
    if (!bootstrap || !squadData) return []
    
    return bootstrap.elements
      .filter(el => !squadData.picks.find(pick => pick.element === el.id))
      .sort((a, b) => (b.xp_o5 ?? 0) - (a.xp_o5 ?? 0))
      .slice(0, 5)
      .map(player => {
        const position = bootstrap.element_types.find(type => type.id === player.element_type)?.singular_name ?? 'Player'
        const team = bootstrap.teams.find(team => team.id === player.team)?.short_name ?? 'UNK'
        return {
          ...player,
          position_name: position,
          team_name: team,
          value_for_money: ((player.xp_o5 ?? 0) / (player.now_cost / 10)).toFixed(2)
        }
      })
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
                <span>Bank: £{(squadData.entry_history.bank / 10).toFixed(1)}m</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setOptimizerOpen(true)}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Optimize Squad
              </Button>

              <Button variant="outline" onClick={() => refetchSquad()}>
                <Shuffle className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Transfer Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Suggestions (3-5 GW Expected Points)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTransferSuggestions().map((player) => (
              <div key={player.id} className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
                      alt={player.web_name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      onError={() => {
                        // Fallback to default image
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{player.web_name}</div>
                    <div className="text-xs text-gray-600">{player.team_name} • {player.position_name}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-bold text-green-600">{(player.xp_o5 ?? 0).toFixed(2)} xP</span>
                      <span className="text-xs text-gray-500">£{(player.now_cost / 10).toFixed(1)}m</span>
                    </div>
                    <div className="text-xs text-blue-600">Value: {player.value_for_money} xP/£</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
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
        </CardContent>
      </Card>

      {/* Bench */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bench</CardTitle>
        </CardHeader>
        <CardContent>
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
