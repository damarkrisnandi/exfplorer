'use client'
import { cn } from "@/lib/utils"
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"
import Image from "next/image"
import { useEffect, useState } from "react"

type ElementCardProps = {
  className?: string,
  photo: string,
  web_name?: string,
  event_points: number,
  is_captain: boolean,
  is_vice_captain: boolean,
  multiplier: number

}
export default function ElementCard({
  className,

  photo,
  web_name,
  event_points,
  is_captain=false,
  is_vice_captain=false,
  multiplier=0,
}:  ElementCardProps) {
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
    <Card className={cn(
      'w-12 h-16 md:w-20 md:h-24 py-1 md:py-4 relative',
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
      <CardHeader className="p-0">
        <div className="w-full flex flex-col justify-center items-center">
          <div className="relative w-8 h-8 md:w-12 md:h-12">
            {/* <Image
              src={photo}
              fill={true}
              className="w-8 h-8 md:w-12 md:h-12"
              sizes="20"
              alt={`pl-logo`}
            /> */}
          </div>
          <CardTitle className="text-[0.5em] md:text-[0.7rem] md:font-semibold">{web_name}</CardTitle>
          <CardDescription className="w-full bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white rounded-b-lg border-white">
            <div className="px-[0.3rem] md:px-2 py-full">
              <p className="text-[0.5em] md:text-[0.7rem] font-semibold">{!is_captain ?  event_points : event_points * multiplier }Pts</p>
            </div>
          </CardDescription>
        </div>

      </CardHeader>
    </Card>
  )
}
