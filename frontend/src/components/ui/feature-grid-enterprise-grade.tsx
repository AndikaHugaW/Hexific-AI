"use client";

import React from 'react';
import { Terminal, Sparkles, Zap, Network, Link, MessageSquare } from 'lucide-react';

// Define the icon type
type IconType = React.ElementType | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

// API (Props) Definition
export interface FeatureItem {
  id: string;
  icon: IconType;
  title: string;
  description: string;
}

export interface FeatureGridProps {
  features: FeatureItem[];
  sectionTitle?: React.ReactNode;
  sectionSubtitle?: React.ReactNode;
}

// Hexific AI specific features
const hexificFeatures: FeatureItem[] = [
  {
    id: "slither",
    icon: Terminal,
    title: "Slither Analysis",
    description: "Industry-standard static analysis detecting 80+ vulnerability patterns in your Solidity code.",
  },
  {
    id: "ai-insights",
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Claude AI provides deep analysis with detailed explanations and fix recommendations.",
  },
  {
    id: "instant",
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive audit reports in seconds, not days. Fast feedback for rapid development.",
  },
  {
    id: "multichain",
    icon: Network,
    title: "Multi-Chain Support",
    description: "Audit contracts on Ethereum, Polygon, Arbitrum, Optimism, Base, and more networks.",
  },
  {
    id: "etherscan",
    icon: Link,
    title: "Etherscan Integration",
    description: "Directly audit verified contracts by pasting their address. No source code needed.",
  },
  {
    id: "assistant",
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Ask our AI about any vulnerability. Get instant explanations and best practice guidance.",
  },
];

// Feature Card Component
const FeatureCard: React.FC<{ feature: FeatureItem }> = ({ feature }) => {
  const IconComponent = feature.icon;
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.5)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(52, 211, 153, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          width: 'fit-content',
          borderRadius: '10px',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          color: '#34d399',
        }}
      >
        <IconComponent className="h-6 w-6" />
      </div>
      
      {/* Title */}
      <h3
        style={{
          marginBottom: '8px',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'white',
        }}
      >
        {feature.title}
      </h3>
      
      {/* Description */}
      <p
        style={{
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        {feature.description}
      </p>
    </div>
  );
};

// Main Feature Grid Component
const FeatureGrid: React.FC<FeatureGridProps> = ({
  features,
  sectionTitle,
  sectionSubtitle,
}) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        padding: '80px 24px',
        backgroundColor: '#000000',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        {(sectionTitle || sectionSubtitle) && (
          <div
            style={{
              textAlign: 'center',
              maxWidth: '768px',
              margin: '0 auto 64px',
            }}
          >
            {sectionTitle && (
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: '16px',
                }}
              >
                {sectionTitle}
              </h2>
            )}
            {sectionSubtitle && (
              <p
                style={{
                  fontSize: '1.125rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1.7,
                }}
              >
                {sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Default Export with Hexific Features
const HexificFeatureGrid: React.FC = () => {
  return (
    <FeatureGrid
      features={hexificFeatures}
      sectionTitle="Why Choose Hexific?"
      sectionSubtitle="Enterprise-grade security analysis with cutting-edge AI technology"
    />
  );
};

export { FeatureGrid, FeatureCard, hexificFeatures };

export default HexificFeatureGrid;
