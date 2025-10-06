'use client'
import { cn } from "@/lib/utils"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"
const errorImage = 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3C!--%20License%3A%20PD.%20Made%20by%20Icooon%20Mono%3A%20https%3A%2F%2Ficooon-mono.com%2F%20--%3E%3Csvg%20height%3D%22800px%22%20width%3D%22800px%22%20version%3D%221.1%22%20id%3D%22_x32_%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20%20viewBox%3D%220%200%20512%20512%22%20%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E.st0%7Bfill%3A%23000000%3B%7D%3C%2Fstyle%3E%3Cg%3E%3Cpath%20class%3D%22st0%22%20d%3D%22M341.942%2C356.432c-20.705-12.637-28.134-11.364-28.134-36.612c0-8.837%2C0-25.256%2C0-40.403c11.364-12.62%2C15.497-11.049%2C25.107-60.597c19.433%2C0%2C18.174-25.248%2C27.34-47.644c7.471-18.238%2C1.213-25.632-5.08-28.654c5.144-66.462%2C5.144-112.236-70.292-126.436c-27.344-23.437-68.605-15.48-88.158-11.569c-19.536%2C3.911-37.159%2C0-37.159%2C0l3.356%2C31.49c-28.608%2C34.332-14.302%2C80.106-18.908%2C106.916c-6.002%2C3.27-11.416%2C10.809-4.269%2C28.253c9.165%2C22.396%2C7.906%2C47.644%2C27.34%2C47.644c9.61%2C49.548%2C13.742%2C47.977%2C25.107%2C60.597c0%2C15.147%2C0%2C31.566%2C0%2C40.403c0%2C25.248-8.581%2C25.683-28.133%2C36.612c-47.14%2C26.349-108.569%2C41.658-119.575%2C124.01C48.468%2C495.504%2C134.952%2C511.948%2C256%2C512c121.048-0.052%2C207.528-16.496%2C205.517-31.558C450.511%2C398.09%2C388.519%2C384.847%2C341.942%2C356.432z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E';

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
  const [imageError, setImageError] = useState(false);

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
    <div className="flex flex-col gap-1">
      <div className={cn(
        'w-[3.5rem] md:w-20 relative overflow-hidden',
        'transition-all duration-500 ease-out',
        'hover:shadow-lg hover:-translate-y-1',
        'group cursor-pointer',
        !easeInOutCard && 'translate-y-4 opacity-0',
        easeInOutCard && 'translate-y-0 opacity-100',
        // Add special styling for captain/vice captain
        className
      )}>        {/* Captain/Vice Captain Badge */}
        {(is_captain || is_vice_captain) && (
          <div className={cn(
            "absolute top-1 right-1 z-40",
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
          "absolute top-0.5 left-0.5 z-40",
          "px-1 py-0.5 rounded-full text-xs font-medium",
          "flex items-center gap-0.5",
          "transition-all duration-500",
          !easeInOutBadge && 'scale-0 opacity-0',
          easeInOutBadge && 'scale-100 opacity-100',
          getTrendColor()
        )}>
          {getTrendIcon()}
        </div>


        <div className="p-1.5 md:p-2 h-full flex flex-col">
          <div className=" absolute top-4 left-0.5 z-40">
            {/* Points & xP - Minimal display */}
            {showCurrent && (
              <div className="flex items-center gap-1 mb-1 justify-between">
                <span className="text-xs font-bold text-gray-900">{actualPoints}</span>
                {/* <span className="text-[0.6em] text-gray-500">{actualXpCurrent.toFixed(1)}xP</span> */}
              </div>
            )}
          </div>

          {/* Player Photo */}
          <div className="flex justify-center mb-1">
            <Image
              src={!imageError ? photo : errorImage}
              width={64}
              height={64}
              alt={web_name ?? "Player photo"}
              className="w-full h-auto rounded-md"
              onError={() => setImageError(true)}
            />
          </div>
          {/* Player Name */}
          <div className="text-center">
            <h3 className="text-[0.6em] md:text-sm md:font-semibold text-gray-800 truncate leading-tight">
              {web_name}
            </h3>
          </div>



          {/* Next Fixtures - Minimal */}
          {showNext && nextFixtures && nextFixtures.length > 0 && (
            <div className="flex justify-center gap-0.5 mt-1">
              <span className="text-[0.6em]">{actualXp.toFixed(1)}xP</span>
              {nextFixtures.slice(0, 2).map((f, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn(
                    "text-[0.5em] px-1 py-0.5 border",
                    f.difficulty === 5 ? "bg-red-100 border-red-300 text-red-800"
                      : f.difficulty === 4 ? "bg-orange-100 border-orange-300 text-orange-800"
                        : f.difficulty === 3 ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                          : f.difficulty === 2 ? "bg-green-100 border-green-300 text-green-800"
                            : f.difficulty === 1 ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                              : "bg-gray-100 border-gray-300 text-gray-800"
                  )}
                >
                  {f.team}
                </Badge>
              ))}
              {nextFixtures.length > 2 && (
                <Badge variant="outline" className="text-[0.5em] px-1 py-0.5 bg-gray-100 text-gray-600">
                  +{nextFixtures.length - 2}
                </Badge>
              )}
            </div>
          )}
          {/* Expected Points (xP) */}
        </div>

      </div>
    </div>
  )
}
