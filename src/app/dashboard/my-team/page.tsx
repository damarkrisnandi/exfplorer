import { auth } from "@/server/auth";
import { ManagerForm } from "@/components/mapping-manager";
import { cn } from "@/lib/utils";
import MyTeamClient from "./client-component";

export default async function Page() {
  const session = await auth();
  console.log(session);

  return (
    <div className={"w-full flex flex-col gap-2"}>
      {session && (
        <div className={cn("bg-gray-900 p-4 w-full flex justify-center items-center" )}>
        <ManagerForm className="w-full !text-black" session={session} />
        </div>
      )}
        {session?.user?.manager && (
          <MyTeamClient session={{
            user: {
              manager: session.user.manager
            }
          }} />
        )}
    </div>
  )
}
