"use client"

import { useState } from "react"
import CountdownTimer from "@/components/countdown-timer"

export default function MainDeadline() {
  const [initialTime, setInitialTime] = useState({ days: 1, hours: 0,  minutes: 0, seconds: 17 })

  return (
    <main className="flex min-h-96  md:min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-gray-400 text-2xl font-twk-everett">Transfer Deadline:</div>
        <CountdownTimer
          initialDays={initialTime.days}
          initialHours={initialTime.hours}
          initialMinutes={initialTime.minutes}
          initialSeconds={initialTime.seconds}
        />
      </div>
    </main>
  )
}
