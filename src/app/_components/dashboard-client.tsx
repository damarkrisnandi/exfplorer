import { SessionProvider } from "next-auth/react";
import MainDeadline from "./main-deadline";
import PickView from "@/components/pick-view";

export function DashboardClient() {
  return (
    <SessionProvider>
      <MainDeadline />
      <PickView />
    </SessionProvider>
  )
}
