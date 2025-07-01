import Link from "next/link";
import MainDeadline from "@/app/_components/main-deadline";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/svg-icon";
import { ManagerForm } from "@/components/mapping-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center  bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white">
        <div className="container flex flex-col items-center justify-center4 px-4 py-16">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-[5rem]">
              ex<span className="text-[hsl(280,100%,70%)]">FPL</span>orer.app
            </h1>
            <p className="text-2xl text-white">
              FPL predictions and analysis
            </p>
          </div>
          <MainDeadline />

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-center text-2xl text-white">
                {session &&
                  <span className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={session?.user.image ?? `https://placehold.co/20x20?text=A`} alt={session?.user.name} />
                      <AvatarFallback>{session?.user.name[0]}</AvatarFallback>
                    </Avatar>

                    Logged in as {session.user?.name}
                  </span>}
              </div>
              <Button asChild>
                <Link
                  href={session ? "/logout" : "/login"}
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  <DiscordIcon />
                  {session ? "Logout" : "Login"}
                </Link>

              </Button>
              {session && (
                <>
                <ManagerForm className="w-full" session={session} />
                </>
              )}
          </div>
          </div>


        </div>
      </main>
    </HydrateClient>
  );
}
