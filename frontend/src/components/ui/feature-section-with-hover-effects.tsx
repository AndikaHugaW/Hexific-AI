"use client";

import { cn } from "@/lib/utils";
import {
  Terminal,
  Sparkles,
  Zap,
  Network,
  Link,
  MessageSquare,
} from "lucide-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Slither Analysis",
      description:
        "Industry-standard static analysis detecting 80+ vulnerability patterns in your Solidity code.",
      icon: <Terminal className="h-8 w-8" />,
    },
    {
      title: "AI-Powered Insights",
      description:
        "Claude AI provides deep analysis with detailed explanations and fix recommendations.",
      icon: <Sparkles className="h-8 w-8" />,
    },
    {
      title: "Instant Results",
      description:
        "Get comprehensive audit reports in seconds, not days. Fast feedback for rapid development.",
      icon: <Zap className="h-8 w-8" />,
    },
    {
      title: "Multi-Chain Support",
      description:
        "Audit contracts on Ethereum, Polygon, Arbitrum, Optimism, Base, and more networks.",
      icon: <Network className="h-8 w-8" />,
    },
    {
      title: "Etherscan Integration",
      description:
        "Directly audit verified contracts by pasting their address. No source code needed.",
      icon: <Link className="h-8 w-8" />,
    },
    {
      title: "AI Assistant",
      description:
        "Ask our AI about any vulnerability. Get instant explanations and best practice guidance.",
      icon: <MessageSquare className="h-8 w-8" />,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col p-8 rounded-2xl",
        "bg-gradient-to-b from-white/5 to-transparent",
        "border border-white/10",
        "transition-all duration-300",
        "hover:border-emerald-500/50",
        "hover:bg-gradient-to-b hover:from-emerald-500/10 hover:to-transparent",
        "hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]",
        "hover:-translate-y-1"
      )}
    >
      {/* Icon Container */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:scale-110">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="mb-3 text-xl font-bold text-white">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm leading-relaxed text-white/60">
        {description}
      </p>
      
      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 h-1 w-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 group-hover:w-full" />
    </div>
  );
};
