'use client'
import { cn } from "@/lib/utils"
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"
import Image from "next/image"
import { useEffect, useState } from "react"
import { CheckIcon, X, type Check } from "lucide-react"

type ElementCardProps = {
  className?: string,
  photo: string,
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
}
export default function ElementCard({
  className,

  photo,
  web_name,
  event_points,
  is_captain = false,
  is_vice_captain = false,
  multiplier = 0,
  xp = 0,
  delta_xp = 0,
  xp_current = 0,
  nextFixtures
}: ElementCardProps) {
  const [easeInOutCard, setEaseInOutCard] = useState<boolean>(false);
  const [easeInOutBadge, setEaseInOutBadge] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setEaseInOutCard(true);
    }, Math.random() * 100);
  })

  useEffect(() => {
    setTimeout(() => {
      setEaseInOutBadge(true);
    }, 700);
  })
  return (
    <div className="flex flex-col gap-1">
      <Card className={cn(
        'w-12 h-16 md:w-16 md:h-20 py-2 md:py-4 relative',
        'bg-gray-900/10',
        'transition-all duration-300 -translate-6 opacity-0',
        easeInOutCard ? 'translate-0 opacity-100' : '',
        className
      )}>
        {is_captain &&
          <div className={cn(
            "absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-black border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900",
            'transition-all duration-300 scale-0 opacity-0',
            easeInOutBadge ? 'scale-100 opacity-100' : '',
          )}>C</div>}
        {is_vice_captain &&
          <div className={cn(
            "absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-black border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900",
            'transition-all duration-300 scale-0 opacity-0',
            easeInOutBadge ? 'scale-100 opacity-100' : '',
          )}>V</div>}

        <div className={cn(
          "absolute inline-flex items-end justify-center text-white rounded-lg top-1 start-1 dark:border-gray-900",
          'transition-all duration-300 opacity-0',
          easeInOutBadge ? 'opacity-100' : '',
        )} >
          <div className="flex items-center">
            <p className={cn(
              "font-bold",
              delta_xp >= 0 ? "text-green-700" : "text-red-700",
            )}>|</p>
            <p className="text-lg md:text-3xl font-bold">{!is_captain ? event_points : event_points * multiplier}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-xs">Pts</p>
            <span className="flex items-center bg-gray-600 text-white">
              <p className="text-[0.4em] text-white">{xp_current.toFixed(1)}xP</p>
            </span>
          </div>
        </div>
        <CardHeader className="p-0">
          <div className="w-full flex flex-col justify-center items-center">
            <div className="relative w-8 h-8 md:w-12 md:h-12">
              <Image
                src={photo}
                fill={true}
                className="w-8 h-8 md:w-12 md:h-12"
                sizes="20"
                alt={`pl-logo`}
                priority={true}
              />
            </div>
            <CardTitle className="text-[0.5em] md:text-[0.7rem] md:font-semibold text-ellipsis text-white">{web_name}</CardTitle>
            <CardDescription className="w-full text-white">
              {/* <div className="px-[0.3rem] md:px-2 py-full flex justify-center">
                <p className={cn(
                  "text-[0.5em] md:text-[0.7rem] font-semibold",
                  delta_xp >= 0 ? "bg-green-700" : "bg-red-700",
                  )}>{!is_captain ?  event_points : event_points * multiplier }Pts</p>
                <p className={cn(
                  "text-[0.5em] md:text-[0.7rem] bg-gray-700",

                  )}>{ (!is_captain ?  xp_current : xp_current * multiplier).toFixed(1) }xP</p>
              </div> */}
            </CardDescription>
          </div>

        </CardHeader>
      </Card>
      <div className="px-[0.3rem]  md:px-2 flex flex-col" style={{ zIndex: 10 }}>
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-[0.5em] md:text-[0.7rem]",
          )}>Next</p>
          {/* next fixture and difficulty */}
          <ul className="flex">
            {!!nextFixtures ? nextFixtures?.map((fixture: { team?: string; difficulty?: number; event?: number; teamId?: number }, index: number) => (
              <li key={index} className="flex items-center">
                <p
                  className={cn(
                    "text-[0.5em] md:text-[0.7rem] font-semibold",
                    "text-white px-1",
                    fixture?.difficulty === 5
                      ? "bg-red-900"
                      : fixture?.difficulty === 4
                      ? "bg-red-700"
                      : fixture?.difficulty === 3
                      ? "bg-gray-500"
                      : fixture?.difficulty === 2
                      ? "bg-green-600"
                      : fixture?.difficulty === 1
                      ? "bg-green-900"
                      : ""
                  )}
                >
                  {fixture?.team}
                </p>
                {/* <span className={cn(
                  "w-2 h-2 rounded-full",
                  fixture?.difficulty && fixture?.difficulty <= 2 ? "bg-green-700" : fixture?.difficulty &&  fixture?.difficulty <= 4 ? "bg-yellow-500" : "bg-red-700",
                )}></span> */}
              </li>
            )) : null}
          </ul>
        </div>
        <p className={cn(
          "text-[0.5em] md:text-[0.7rem] bg-gray-700 text-white",

        )}>{(!is_captain ? xp : xp * multiplier).toFixed(1)}xP</p>
      </div>

    </div>
  )
}
