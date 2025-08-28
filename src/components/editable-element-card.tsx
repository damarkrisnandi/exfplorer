'use client'

import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MoreVertical, ArrowUpDown, Users, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { PlayerPicked } from "@/server/api/routers/squad-pick"

type EditableElementCardProps = {
  player: PlayerPicked
  benchPlayers: PlayerPicked[]
  isBench?: boolean
  onSubstitute: (outPlayer: PlayerPicked, inPlayer: PlayerPicked) => void
  onTransfer: () => void
}

export default function EditableElementCard({
  player,
  benchPlayers,
  isBench = false,
  onSubstitute,
  onTransfer
}: EditableElementCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const actualPoints = player.is_captain ? (player.event_points ?? 0) * (player.multiplier || 2) : (player.event_points ?? 0)

  // Get available substitutes (players of same position)
  const availableSubs = benchPlayers.filter(benchPlayer =>
    benchPlayer.element_type === player.element_type &&
    benchPlayer.element !== player.element
  )

  const getTrendIcon = () => {
    if (!player.delta_xp) return <Minus className="w-2 h-2 md:w-3 md:h-3" />
    if (player.delta_xp > 0) return <TrendingUp className="w-2 h-2 md:w-3 md:h-3" />
    if (player.delta_xp < 0) return <TrendingDown className="w-2 h-2 md:w-3 md:h-3" />
    return <Minus className="w-2 h-2 md:w-3 md:h-3" />
  }

  const getTrendColor = () => {
    if (!player.delta_xp) return "text-gray-600 bg-gray-50"
    if (player.delta_xp > 0) return "text-green-600 bg-green-50"
    if (player.delta_xp < 0) return "text-red-600 bg-red-50"
    return "text-gray-600 bg-gray-50"
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        'w-[3.5rem] h-20 md:w-20 md:h-28 relative overflow-hidden',
        'bg-gradient-to-b from-white to-gray-50',
        'border border-gray-200 hover:border-blue-300',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:-translate-y-1',
        'cursor-pointer',
        // Special styling for captain/vice captain
        player.is_captain && 'ring-2 ring-yellow-400 border-yellow-400',
        player.is_vice_captain && 'ring-2 ring-blue-400 border-blue-400',
        isBench && 'opacity-75'
      )}>

        {/* Captain/Vice Captain Badge */}
        {(player.is_captain || player.is_vice_captain) && (
          <div className={cn(
            "absolute -top-1 -right-1 z-10",
            "w-4 h-4 md:w-6 md:h-6 rounded-full border border-white",
            "flex items-center justify-center text-xs font-bold text-white",
            player.is_captain && "bg-yellow-500 shadow-yellow-200",
            player.is_vice_captain && "bg-blue-500 shadow-blue-200",
          )}>
            <span className="text-xs md:text-sm">{player.is_captain ? 'C' : 'V'}</span>
          </div>
        )}

        {/* Performance Trend Indicator */}
        <div className={cn(
          "absolute top-0.5 left-0.5 z-10",
          "px-1 py-0.5 rounded-full text-xs font-medium",
          "flex items-center gap-0.5",
          getTrendColor()
        )}>
          {getTrendIcon()}
        </div>

        {/* Edit Menu - Only show on hover */}
        {isHovered && (
          <div className="absolute top-1 right-1 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-black/20 hover:bg-black/40">
                  <MoreVertical className="h-3 w-3 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!isBench && availableSubs.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                      Substitute with:
                    </div>
                    {availableSubs.map((sub) => (
                      <DropdownMenuItem
                        key={sub.element}
                        onClick={() => onSubstitute(player, sub)}
                        className="flex items-center gap-2"
                      >
                        <ArrowUpDown className="h-3 w-3" />
                        <span className="truncate">{sub.web_name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={onTransfer}
                  className="flex items-center gap-2"
                >
                  <Users className="h-3 w-3" />
                  Transfer Player
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <CardContent className="p-1.5 md:p-2 h-full flex flex-col">
          {/* Player Photo */}
          <div className="flex-1 flex items-center justify-center mb-1">
            <img
              src={player.photo ?? "/pl-main-logo.png"}
              alt={player.web_name}
              className="w-8 h-8 md:w-12 md:h-12 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/pl-main-logo.png"
              }}
            />
          </div>

          {/* Player Name */}
          <div className="text-center">
            <h3 className="text-[0.6em] md:text-sm md:font-semibold text-gray-800 truncate leading-tight">
              {player.web_name}
            </h3>
          </div>

          {/* Points Display */}
          <div className="flex-1 flex items-center justify-center mb-1">
            <div className="text-center">
              <div className="text-sm md:text-xl font-bold text-gray-900 leading-none">
                {actualPoints}
              </div>
            </div>
          </div>

          {/* Expected Points */}
          {player.xp_current && (
            <div className="text-center mt-0.5 md:mt-1">
              <div className="text-[0.5em] text-gray-600 bg-gray-100 rounded-full px-1.5 md:px-2 py-0.5 md:py-1">
                {player.xp_current.toFixed(1)}xP
              </div>
            </div>
          )}

          {/* Next Fixtures Preview */}
          {player.nextFixtures && player.nextFixtures.length > 0 && (
            <div className="mt-1">
              <div className="flex gap-0.5 justify-center">
                {player.nextFixtures.slice(0, 2).map((fixture, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={cn(
                      "text-[0.4em] px-1 py-0.5 border font-medium",
                      fixture.difficulty === 5 ? "bg-red-100 border-red-300 text-red-800" :
                      fixture.difficulty === 4 ? "bg-orange-100 border-orange-300 text-orange-800" :
                      fixture.difficulty === 3 ? "bg-yellow-100 border-yellow-300 text-yellow-800" :
                      fixture.difficulty === 2 ? "bg-green-100 border-green-300 text-green-800" :
                      "bg-emerald-100 border-emerald-300 text-emerald-800"
                    )}
                  >
                    {fixture.team}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
