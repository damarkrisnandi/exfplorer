'use client'

import { useState, useEffect } from 'react'
import { api } from "@/trpc/react"
import useBootstrapStore from "@/stores/bootstrap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Shuffle, Zap } from "lucide-react"
import type { Element } from "@/lib/bootstrap-type"
import type { PlayerPicked, PickData } from "@/server/api/routers/squad-pick"
import EditableElementCard from "@/components/editable-element-card"
import SquadOptimizer from "@/components/squad-optimizer"
import { optimizationProcess } from "@/lib/optimization"
import PlayerTransferModal from '@/components/player-transfer-modal'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { DialogTitle } from '@radix-ui/react-dialog'

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
  const [isClient, setIsClient] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPicked | null>(null)
  const [optimizerOpen, setOptimizerOpen] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [squadData, setSquadData] = useState<PickData | null>(null)
  const [transferModalOpen, setTransferModalOpen] = useState(false)

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

  const handlePlayerSubstitution = async (outPlayer: PlayerPicked, inPlayer: PlayerPicked) => {
    if (!squadData) return

    const newPicks = squadData.picks.map(pick => {
      if (pick.element === outPlayer.element) {
        return { ...inPlayer, position: pick.position, is_captain: pick.is_captain, is_vice_captain: pick.is_vice_captain }
      }
      if (pick.element === inPlayer.element) {
        return { ...outPlayer, position: pick.position, is_captain: pick.is_captain, is_vice_captain: pick.is_vice_captain }
      }
      return pick
    })

    setSquadData({ ...squadData, picks: newPicks })
  }

  const handlePlayerTransfer = async (outPlayer: PlayerPicked, inPlayer: Element) => {
    if (!squadData) return

    const newPlayerPicked: PlayerPicked = {
      element: inPlayer.id,
      position: outPlayer.position,
      multiplier: outPlayer.multiplier,
      is_captain: outPlayer.is_captain,
      is_vice_captain: outPlayer.is_vice_captain,
      element_type: inPlayer.element_type,
      web_name: inPlayer.web_name,
      photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${inPlayer.code}.png`,
      event_points: inPlayer.event_points,
    }

    const newPicks = squadData.picks.map(pick =>
      pick.element === outPlayer.element ? newPlayerPicked : pick
    )

    setSquadData({ ...squadData, picks: newPicks })
    setTransferModalOpen(false)
  }

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
        modelName: 'pick'
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

  const totalPoints = squadData.picks.reduce((sum, pick) => sum + (pick.event_points ?? 0), 0)

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
                <span>Total Points: {totalPoints}</span>
                <span>Bank: £{(squadData.entry_history.bank / 10).toFixed(1)}m</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={optimizerOpen} onOpenChange={setOptimizerOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Optimize Squad
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Squad Optimizer</DialogTitle>
                  </DialogHeader>
                  <SquadOptimizer
                    squadData={squadData}
                    bootstrap={bootstrap}
                    fixtures={fixtures ?? []}
                    onOptimize={handleSquadOptimization}
                    isOptimizing={isOptimizing}
                  />
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={() => refetchSquad()}>
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
                <EditableElementCard
                  key={pick.element}
                  player={pick}
                  benchPlayers={bench}
                  onSubstitute={handlePlayerSubstitution}
                  onTransfer={() => {
                    setSelectedPlayer(pick)
                    setTransferModalOpen(true)
                  }}
                />
              ))}
            </div>

            {/* Defenders */}
            <div className="flex justify-evenly items-center">
              {def.map((pick) => (
                <EditableElementCard
                  key={pick.element}
                  player={pick}
                  benchPlayers={bench}
                  onSubstitute={handlePlayerSubstitution}
                  onTransfer={() => {
                    setSelectedPlayer(pick)
                    setTransferModalOpen(true)
                  }}
                />
              ))}
            </div>

            {/* Midfielders */}
            <div className="flex justify-evenly items-center">
              {mid.map((pick) => (
                <EditableElementCard
                  key={pick.element}
                  player={pick}
                  benchPlayers={bench}
                  onSubstitute={handlePlayerSubstitution}
                  onTransfer={() => {
                    setSelectedPlayer(pick)
                    setTransferModalOpen(true)
                  }}
                />
              ))}
            </div>

            {/* Forwards */}
            <div className="flex justify-evenly items-center">
              {fwd.map((pick) => (
                <EditableElementCard
                  key={pick.element}
                  player={pick}
                  benchPlayers={bench}
                  onSubstitute={handlePlayerSubstitution}
                  onTransfer={() => {
                    setSelectedPlayer(pick)
                    setTransferModalOpen(true)
                  }}
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
              <EditableElementCard
                key={pick.element}
                player={pick}
                benchPlayers={[]}
                isBench={true}
                onSubstitute={handlePlayerSubstitution}
                onTransfer={() => {
                  setSelectedPlayer(pick)
                  setTransferModalOpen(true)
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Modal */}
      <PlayerTransferModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        selectedPlayer={selectedPlayer}
        bootstrap={bootstrap}
        onTransfer={handlePlayerTransfer}
        currentSquad={squadData}
      />
    </div>
  )
}
