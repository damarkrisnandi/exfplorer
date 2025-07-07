// import { DashboardClient } from "../_components/dashboard-client";
import { auth } from "@/server/auth";
import PickView from "@/components/pick-view";
import { ManagerForm } from "@/components/mapping-manager";
import { cn } from "@/lib/utils";
import WildcardView from "@/components/wildcard-view";
import { StorageContainer } from "@/components/storage-container";

export default async function Page() {
  const session = await auth();
  console.log(session);

  return (
    <div className={"w-full"}>
      <StorageContainer />
      {session && (
        <div className={cn("bg-gray-900 p-4 w-full flex justify-center items-center" )}>
        <ManagerForm className="w-full !text-black" session={session} />
        </div>
      )}
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
  )
}
