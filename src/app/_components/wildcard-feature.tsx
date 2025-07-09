"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WildcardView from "@/components/wildcard-view";
import { Zap, Users, TrendingUp, Star, ArrowRight, Sparkles } from "lucide-react";

const WildcardFeature = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze player form, fixtures, and statistics to recommend optimal wildcard picks."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Balance Optimizer",
      description: "Ensure perfect balance across all positions while maximizing points potential and budget efficiency."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Future Fixture Planning",
      description: "Plan your wildcards around upcoming fixture swings and double gameweeks for maximum advantage."
    }
  ];

  return (
    <section className="py-20 bg-gray-200/10 text-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left side - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hsl(34,197,94)/10 text-hsl(34,197,94) font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Wildcard Mastery
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-200 leading-tight">
              Perfect Your
              <span className="block text-gray-50">Wildcard Strategy</span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Transform your wildcard from a panic button into a strategic weapon. Our AI analyzes
              millions of data points to craft the perfect 15-man squad for your playing style.
            </p>

            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-hsl(34,197,94)/10 p-3 rounded-lg text-gray-300 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-300">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="bg-hsl(34,197,94) hover:bg-hsl(22,163,74) text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Try Wildcard Planner
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Right side - Interactive Preview */}
          <div className="relative">
            <div className="bg-gradient-to-br from-hsl(34,197,94)/5 to-hsl(22,163,74)/5 rounded-2xl w-full">

              <WildcardView />
            </div>

            {/* Floating badges */}
            {/* <div className="absolute -top-4 -right-4 bg-hsl(249,115,22) text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              +23% Win Rate
            </div>
            <div className="absolute -bottom-4 -left-4 bg-hsl(245,158,11) text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              AI Optimized
            </div> */}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WildcardFeature;
