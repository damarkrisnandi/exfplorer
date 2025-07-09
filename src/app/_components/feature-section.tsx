"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  BarChart3,
  Users,
  Shield,
  Clock,
  Trophy,
  Target,
  Lightbulb,
  TrendingUp
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    // {
    //   icon: <Brain className="w-8 h-8" />,
    //   title: "AI Predictions",
    //   description: "Machine learning algorithms analyze vast datasets to predict player performance with 95% accuracy.",
    //   color: "from-purple-500 to-purple-600"
    // },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Deep statistical analysis including xG, xA, form trends, and fixture difficulty ratings.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-Time Updates",
      description: "Live injury updates, team news, and lineup confirmations minutes before deadlines.",
      color: "from-hsl(34,197,94) to-hsl(22,163,74)"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Captain Predictor",
      description: "Advanced captain selection algorithm that considers matchups, form, and ownership.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Squad Optimizer",
      description: "Build the perfect 15-man squad while managing budget constraints and team balance.",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Transfer Planner",
      description: "Plan multi-week transfer strategies to maximize your team's potential over time.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Risk Assessment",
      description: "Evaluate the risk vs reward of every transfer and captain choice with detailed analysis.",
      color: "from-indigo-500 to-indigo-600"
    },
    // {
    //   icon: <Trophy className="w-8 h-8" />,
    //   title: "League Tracking",
    //   description: "Monitor your performance across multiple leagues and get personalized improvement tips.",
    //   color: "from-yellow-500 to-yellow-600"
    // },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Smart Insights",
      description: "Receive weekly insights and tips tailored to your team and playing style.",
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-700/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-50">
            Everything You Need to
            <span className="block text-gray-100">Dominate Fantasy</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From AI-powered predictions to real-time updates, we&apos;ve built the ultimate toolkit
            for fantasy football success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2"
            >
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-100">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
