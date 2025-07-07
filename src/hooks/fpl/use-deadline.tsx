'use client'

import { useEffect, useState } from "react";

const useDeadline = ({ bootstrap }: any) => {
  const [event, setEvent] = useState<any>(null);
  const [deadline, setDeadline] = useState<any>(null);
  // if (!bootstrap) {
  //   return null;
  // }

  useEffect(() => {
    const nextEvents = bootstrap.events.filter((event: any) =>
      new Date(event.deadline_time).getTime() > new Date().getTime()
    );
    if (!event) {
      setEvent(nextEvents.length ? nextEvents[0] : { id: 39 });
    }

    if (!deadline) {
      // Update the count down every 1 second
      const x = setInterval(function () {
        let countDownDate = new Date(
          nextEvents.length ? nextEvents[0].deadline_time : new Date(),
        ).getTime();
        // Get today's date and time
        const now = new Date().getTime();

        // Find the distance between now and the count down date
        const distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        // setDeadline(zeroPadded(days) + "d " + zeroPadded(hours) + "h "
        // + zeroPadded(minutes) + "m " + zeroPadded(seconds) + "s ");
        setDeadline({
          days: zeroPadded(days),
          hours: zeroPadded(hours),
          minutes: zeroPadded(minutes),
          seconds: zeroPadded(seconds),
        });

        // If the count down is finished, write some text
        if (distance < 0) {
          clearInterval(x);
          setDeadline(null);
        }
      }, 1000);
    }
  }, [bootstrap, event, deadline]);
  return { deadline, event }
}

function zeroPadded(num: number) {
  if (num < 10) {
    return "0" + num.toString();
  }
  return num.toString();
}


export default useDeadline;
