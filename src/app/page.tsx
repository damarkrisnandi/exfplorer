import Link from "next/link";
import MainDeadline from "@/app/_components/main-deadline";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/svg-icon";
import { ManagerForm } from "@/components/mapping-manager";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import WildcardView from "@/components/wildcard-view";
import WildcardFeature from "./_components/wildcard-feature";
import HeroSection from "./_components/hero-section";
import FeaturesSection from "./_components/feature-section";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center  bg-gradient-to-b from-[#2e026d] to-[#0f0f1a] text-white">
        <div className="w-full">
          <HeroSection session={session} />
        </div>
        <div className="w-full">
          <MainDeadline />
        </div>
        <div className="w-full">
          <WildcardFeature />
        </div>
        <div className="w-full">
          <FeaturesSection />
        </div>
        <footer className="flex justify-center items-center w-full p-10">
          <p className="text-xs text-white font-semibold">2025 &copy;damarkrisnandi</p>
        </footer>
      </main>
    </HydrateClient>
  );
}
