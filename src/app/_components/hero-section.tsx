import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Trophy } from "lucide-react";
import type { Session } from "next-auth";
import Link from "next/link";

type HeroSectionProps = {
  session?: Session | null
}
const HeroSection = ({ session }: HeroSectionProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="animate-fade-in">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hsl(34,197,94)/10 border border-hsl(34,197,94)/20 text-hsl(34,197,94) text-sm font-medium mb-8">
            <Trophy className="w-4 h-4" />
            #1 Fantasy Football Predictor
          </div> */}

          {/* Main headline */}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-[5rem]">
              ex<span className="text-[hsl(280,100%,70%)]">FPL</span>orer.app
            </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Master your wildcard drafts, beat crucial deadlines, and dominate your league with
            AI-powered predictions that give you the winning edge.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild  size="lg" className="bg-hsl(34,197,94) hover:bg-hsl(22,163,74) text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link
                href={session ? "/logout" : "/login"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Logout" : "Start Predicting Now"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            {/* <Button variant="outline" size="lg" className="border-hsl(34,197,94) text-hsl(34,197,94) hover:bg-hsl(34,197,94) hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
              Watch Demo
              <Target className="ml-2 w-5 h-5" />
            </Button> */}
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-hsl(34,197,94) mb-1">95%</div>
              <div className="text-gray-400">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-hsl(34,197,94) mb-1">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-hsl(34,197,94) mb-1">$2M+</div>
              <div className="text-gray-400">Winnings Tracked</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-hsl(34,197,94)/10 rounded-full blur-xl animate-pulse-glow"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-hsl(249,115,22)/10 rounded-full blur-2xl animate-pulse-glow" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-hsl(245,158,11)/10 rounded-full blur-lg animate-pulse-glow" style={{animationDelay: '2s'}}></div>
    </div>
  );
};

export default HeroSection;
