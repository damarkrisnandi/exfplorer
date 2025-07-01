"use client"

import { useEffect, useState } from "react"
import CountdownTimer from "@/components/countdown-timer"
import useBootstrapStore from "@/stores/bootstrap"

export default function MainDeadline() {
  const bootstrapStore = useBootstrapStore();
  const [initialTime, setInitialTime] = useState({ days: 1, hours: 0,  minutes: 0, seconds: 17 })

  useEffect(() => {
    if (!bootstrapStore.nextEvent) {
      setInitialTime({ days:0, hours:0,  minutes:0, seconds:0 })
      return
    }

    const now = new Date();
    const nextEventDate = new Date(bootstrapStore.nextEvent.deadline_time);
    const diff = Math.max(0, nextEventDate.getTime() - now.getTime());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setInitialTime({ days, hours, minutes, seconds });
  }, [bootstrapStore])

  return (
    <main className="flex  md:min-h-screen flex-col items-center justify-center">
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
