// import { DashboardClient } from "../_components/dashboard-client";
import { auth } from "@/server/auth";
import PickView from "@/components/pick-view";
import { ManagerForm } from "@/components/mapping-manager";
import { cn, themeGradient } from "@/lib/utils";
import WildcardView from "@/components/wildcard-view";
import { StorageContainer } from "@/components/storage-container";
import { AppLineChart } from "@/components/app-line-chart";
import UpcomingFixturesPage from "./upcoming-fixtures/page";

export default async function Page() {
  const session = await auth();
  console.log(session);

  return (
    <div className={"flex flex-col gap-2 w-full"}>
      <StorageContainer />
      {session && (
        <div className={cn(
          themeGradient,
          "p-4 w-full flex justify-center items-center"
        )}>
        <ManagerForm className="w-full !text-black" session={session} />
        </div>
      )}
      {session?.user?.manager && (
        <div className="w-full flex justify-center">
          <AppLineChart session={{
            user: {
              manager: session.user.manager
            }
          }} />
        </div>
      )}

      <div className="w-full">
        <UpcomingFixturesPage />
      </div>

      <div className="w-full flex flex-col md:flex-row justify-center gap-2">
          <WildcardView />
          {session?.user?.manager && (
            <>
              <PickView session={{
                user: {
                  manager: session.user.manager
                }
              }} />
            </>
          )}
      </div>

    </div>
  )
}
