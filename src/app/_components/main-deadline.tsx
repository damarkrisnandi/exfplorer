"use client"

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import useBootstrapStore from "@/stores/bootstrap";
import { api } from "@/trpc/react";
import { cn, themeGradient } from "@/lib/utils";

const MainDeadline = () => {
  const bootstrapStore = useBootstrapStore();
  const {data: bootstrap} = api.bootstrap.get.useQuery();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!bootstrapStore.bootstrap) {
      bootstrapStore.setBootstrap(bootstrap!)
    }
  }, [bootstrap, bootstrapStore, bootstrapStore.currentEvent])

  useEffect(() => {
    // Set deadline to next Friday at 7:30 PM (typical FPL deadline)
    const getNextDeadline = () => {
      const now = new Date();
      const nextGameweek = bootstrapStore.nextEvent ?  new Date(bootstrapStore.nextEvent.deadline_time) : new Date();
      // nextGameweek.setDate(now.getDate() + (5 - now.getDay() + 7) % 7);
      // nextGameweek.setHours(19, 30, 0, 0); // 7:30 PM

      // If it's already past Friday 7:30 PM, set for next Friday
      if (now > nextGameweek) {
        // nextGameweek.setDate(nextGameweek.getDate() + 7);
      }

      return nextGameweek;
    };

    const deadline = getNextDeadline();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className={cn(
      "flex flex-col items-center",
      themeGradient
      )}>
      <div className="bg-hsl(34,197,94) text-white rounded-lg p-4 min-w-[80px] shadow-lg">
        <div className="text-3xl md:text-4xl font-bold text-center">
          {value.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-700/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium mb-4">
            <AlertCircle className="w-4 h-4" />
            Urgent Deadline
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Next Transfer Deadline
          </h2>
          <p className="text-sm md:text-xl text-gray-300 max-w-2xl mx-auto ">
            Don&apos;t miss out! Make your moves before the deadline hits. Every second counts in fantasy football.
          </p>
        </div>

        <Card className="max-w-11/12 mx-auto shadow-2xl border-0 overflow-hidden bg-gray-50/10">
          <CardContent className="p-8 md:p-12  bg-gray-50/10">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Clock className="w-6 h-6 text-white" />
              <span className="text-lg font-semibold text-gray-200">Gameweek {bootstrapStore?.nextEvent?.id ?? '-'} Deadline</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-hsl(34,197,94)/10 rounded-full text-hsl(34,197,94) font-medium">
                <div className="w-2 h-2 bg-hsl(34,197,94) rounded-full animate-pulse"></div>
                Live Updates
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MainDeadline;
