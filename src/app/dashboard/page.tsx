// import { DashboardClient } from "../_components/dashboard-client";
import { auth } from "@/server/auth";
import PickView from "@/components/pick-view";

export default async function Page() {
  const session = await auth();
  console.log(session);

  return (
    <div className="w-full">
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
