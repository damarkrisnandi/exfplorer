'use client'
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Badge } from "./ui/badge"
import Image from "next/image"
import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type ElementCardProps = {
  className?: string,
  photo?: string,
  web_name?: string,
  event_points: number,
  is_captain: boolean,
  is_vice_captain: boolean,
  multiplier: number
  xp?: number,
  xp_current?: number,
  delta_xp?: number,
  nextFixtures?: {
    team: string;
    event: number;
    difficulty: number;
    teamId: number;
  }[],

  showNext?: boolean
  showCurrent?: boolean
}

export default function ElementCard({
  className,
  photo = "/pl-main-logo.png",
  web_name,
  event_points,
  is_captain = false,
  is_vice_captain = false,
  multiplier = 0,
  xp = 0,
  delta_xp = 0,
  xp_current = 0,
  nextFixtures,
  showNext = true,
  showCurrent = true
}: ElementCardProps) {
  const [easeInOutCard, setEaseInOutCard] = useState<boolean>(false);
  const [easeInOutBadge, setEaseInOutBadge] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEaseInOutCard(true);
    }, Math.random() * 100);

    return () => clearTimeout(timer);
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setEaseInOutBadge(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [])

  const actualPoints = !is_captain ? event_points : event_points * multiplier;
  const actualXp = !is_captain ? xp : xp * multiplier;
  const actualXpCurrent = !is_captain ? xp_current : xp_current * multiplier;
  // Determine performance trend icon and color
  const getTrendIcon = () => {
    if (delta_xp > 0) return <TrendingUp className="w-2 h-2 md:w-3 md:h-3" />;
    if (delta_xp < 0) return <TrendingDown className="w-2 h-2 md:w-3 md:h-3" />;
    return <Minus className="w-2 h-2 md:w-3 md:h-3" />;
  };

  const getTrendColor = () => {
    if (delta_xp > 0) return "text-green-600 bg-green-50";
    if (delta_xp < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };
  return (
    <div className="flex flex-col gap-1">      <Card className={cn(
        'w-[3.7rem] h-20 md:w-20 md:h-28 relative overflow-hidden',
        'bg-gradient-to-b from-white to-gray-50',
        'border border-gray-200 hover:border-blue-300',
        'transition-all duration-500 ease-out',
        'hover:shadow-lg hover:-translate-y-1',
        'group cursor-pointer',
        !easeInOutCard && 'translate-y-4 opacity-0',
        easeInOutCard && 'translate-y-0 opacity-100',
        // Add special styling for captain/vice captain
        is_captain && 'ring-2 ring-yellow-400 border-yellow-400',
        is_vice_captain && 'ring-2 ring-blue-400 border-blue-400',
        className
      )}>        {/* Captain/Vice Captain Badge */}
        {(is_captain || is_vice_captain) && (
          <div className={cn(
            "absolute -top-1 -right-1 z-10",
            "w-4 h-4 md:w-6 md:h-6 rounded-full border border-white",
            "flex items-center justify-center text-xs font-bold text-white",
            "transition-all duration-500",
            !easeInOutBadge && 'scale-0 opacity-0',
            easeInOutBadge && 'scale-100 opacity-100',
            is_captain && "bg-yellow-500 shadow-yellow-200",
            is_vice_captain && "bg-blue-500 shadow-blue-200",
          )}>
            <span className="text-xs md:text-sm">{is_captain ? 'C' : 'V'}</span>
            <div className="absolute inset-0 rounded-full animate-pulse bg-current opacity-20" />
          </div>
        )}        {/* Performance Trend Indicator */}
        <div className={cn(
          "absolute top-0.5 left-0.5 z-10",
          "px-1 py-0.5 rounded-full text-xs font-medium",
          "flex items-center gap-0.5",
          "transition-all duration-500",
          !easeInOutBadge && 'scale-0 opacity-0',
          easeInOutBadge && 'scale-100 opacity-100',
          getTrendColor()
        )}>
          {getTrendIcon()}
        </div>

        <CardContent className="p-1.5 md:p-2 h-full flex flex-col">

          {/* Player Name */}
          <div className="text-center">
            <h3 className="text-[0.6em] md:text-sm md:font-semibold text-gray-800 truncate leading-tight">
              {web_name}
            </h3>
          </div>

          {/* Points Display - Large and prominent */}
          <div className="flex-1 flex items-center justify-center mb-1">
            <div className="text-center">
              <div className="text-sm md:text-2xl font-bold text-gray-900 leading-none">
                {actualPoints}
              </div>
              {/* <div className="text-xs text-gray-500 font-medium hidden md:block">
                {actualPoints === 1 ? 'pt' : 'pts'}
                </div> */}
            </div>
                <div className="text-center mt-0.5 md:mt-1">
                  <div className="text-[0.5em] text-gray-600 bg-gray-100 rounded-full px-1.5 md:px-2 py-0.5 md:py-1">
                    {actualXpCurrent.toFixed(1)}xP
                  </div>
                </div>
          </div>

            {/* Next Fixtures & Additional Info */}
            <div className="px-0.5 md:px-1 space-y-0.5 md:space-y-1">
              {/* Expected Points for upcoming games */}
              <div className="text-center">
                <div className="text-[0.5em] flex items-center gap-2">
                  {actualXp.toFixed(1)}xP
                  {nextFixtures && nextFixtures.length > 0 && (
                    <div>
                      <div className="flex gap-0.5 md:gap-1 flex-wrap justify-center">
                        {nextFixtures.slice(0, 2).map((fixture, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={cn(
                              "text-[0.5em] px-1 md:px-2 py-0.5 border font-medium",
                              fixture?.difficulty === 5
                                ? "bg-red-100 border-red-300 text-red-800"
                                : fixture?.difficulty === 4
                                ? "bg-orange-100 border-orange-300 text-orange-800"
                                : fixture?.difficulty === 3
                                ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                                : fixture?.difficulty === 2
                                ? "bg-green-100 border-green-300 text-green-800"
                                : fixture?.difficulty === 1
                                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                : "bg-gray-100 border-gray-300 text-gray-800"
                            )}
                          >
                            {fixture?.team}
                          </Badge>
                        ))}
                        {nextFixtures.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 md:px-2 py-0.5 bg-gray-100 text-gray-600">
                            +{nextFixtures.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Expected Points (xP) */}
        </CardContent>

      </Card>
    </div>
  )
}
