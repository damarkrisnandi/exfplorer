'use client'

import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

interface DeadlineCountdownProps {
  deadlineTime: string
  className?: string
}

export default function DeadlineCountdown({ deadlineTime, className }: DeadlineCountdownProps) {
  const [countdown, setCountdown] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })

  useEffect(() => {
    const deadlineDate = new Date(deadlineTime)

    // Function to calculate time remaining
    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date()
      const total = Math.max(0, deadlineDate.getTime() - now.getTime())

      const days = Math.floor(total / (1000 * 60 * 60 * 24))
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((total % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds, total }
    }

    // Initial calculation
    setCountdown(calculateTimeRemaining())

    // Update countdown every second
    const interval = setInterval(() => {
      const timeRemaining = calculateTimeRemaining()
      setCountdown(timeRemaining)

      if (timeRemaining.total <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [deadlineTime])

  return (
    <div className="mt-2">
      {/* <div className="text-sm text-gray-600 mb-1">Next deadline:</div> */}
      <div className="">
        <div
          className={cn(
            "px-4 py-2 rounded-md bg-white shadow-md inline-flex gap-2 justify-center items-center",
            countdown.days < 1 && countdown.hours >= 1 ? "text-yellow-600" :
            countdown.hours < 1 ? "text-red-600" : "text-gray-800",
            className
          )}
        >
          <div className="text-center">
            <span className="font-mono font-bold">{countdown.days.toString().padStart(2, '0')}</span>
            <span className="text-xs block">days</span>
          </div>
          <span className="text-lg">:</span>
          <div className="text-center">
            <span className="font-mono font-bold">{countdown.hours.toString().padStart(2, '0')}</span>
            <span className="text-xs block">hours</span>
          </div>
          <span className="text-lg">:</span>
          <div className="text-center">
            <span className="font-mono font-bold">{countdown.minutes.toString().padStart(2, '0')}</span>
            <span className="text-xs block">mins</span>
          </div>
          <span className="text-lg">:</span>
          <div className="text-center">
            <span className="font-mono font-bold">{countdown.seconds.toString().padStart(2, '0')}</span>
            <span className="text-xs block">secs</span>
          </div>
        </div>
        {/* <div className="text-xs text-gray-500">
          {new Date(deadlineTime).toLocaleString()}
        </div> */}
      </div>
    </div>
  )
}
