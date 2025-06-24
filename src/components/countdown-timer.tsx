"use client"

import { useEffect, useState } from "react"
import DigitReel from "./digit-reel"

interface CountdownTimerProps {
  initialDays: number
  initialHours: number
  initialMinutes: number
  initialSeconds: number
}

export default function CountdownTimer({ initialDays = 0, initialHours = 0, initialMinutes = 0, initialSeconds = 0 }: CountdownTimerProps) {
  const [days, setDays] = useState(initialDays)
  const [hours, setHours] = useState(initialHours)
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else if (hours > 0) {
          setHours(hours - 1)
          setMinutes(59)
          setSeconds(59)
        } else if (days > 0) {
          setDays(days - 1)
          setHours(23)
          setMinutes(59)
          setSeconds(59)
        } else {
          clearInterval(interval!)
          setIsActive(false)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, minutes, seconds])

  // Format numbers to always have two digits
  const formattedDays = days.toString().padStart(2, "0")
  const formattedHours = hours.toString().padStart(2, "0")
  const formattedMinutes = minutes.toString().padStart(2, "0")
  const formattedSeconds = seconds.toString().padStart(2, "0")

  return (
    <div className="flex items-center justify-center font-twk-everett">
      <div className="flex gap-1 items-center">
        <div className="flex flex-col items-center mt-[1.5em]">
          <div className="flex">
              <DigitReel className="rounded-l-lg" value={formattedDays[0]!} />
              <DigitReel className="rounded-r-lg" value={formattedDays[1]!} />
          </div>
          <div className="flex justify-center items-center">days</div>
        </div>
        <div className="hidden md:block text-white md:text-7xl font-twk-everett font-normal">:</div>
        <div className="flex flex-col items-center mt-[1.5em]">
          <div className="flex">
              <DigitReel className="rounded-l-lg" value={formattedHours[0]!} />
              <DigitReel className="rounded-r-lg" value={formattedHours[1]!} />
          </div>
          <div className="flex justify-center items-center">hours</div>
        </div>
        <div className="hidden md:block text-white md:text-7xl font-twk-everett font-normal">:</div>
        <div className="flex flex-col items-center mt-[1.5em]">
          <div className="flex">
              <DigitReel className="rounded-l-lg" value={formattedMinutes[0]!} />
              <DigitReel className="rounded-r-lg" value={formattedMinutes[1]!} />
          </div>
          <div className="flex justify-center items-center">minutes</div>
        </div>
        <div className="hidden md:block text-white md:text-7xl font-twk-everett font-normal">:</div>
        <div className="flex flex-col items-center mt-[1.5em]">
          <div className="flex">
              <DigitReel className="rounded-l-lg" value={formattedSeconds[0]!} />
              <DigitReel className="rounded-r-lg" value={formattedSeconds[1]!} />
          </div>
          <div className="flex justify-center items-center">seconds</div>
        </div>
      </div>
    </div>
  )
}
