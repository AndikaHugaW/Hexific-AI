"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { NeonButton } from "./neon-button";

/* ============================================
   LAZY LOADED CANVAS - No SSR
============================================ */
const HeroCanvas = dynamic(
  () => import("./HeroCanvas"),
  { 
    ssr: false, 
    loading: () => <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000000' }} />
  }
);

/* ============================================
   HERO BADGE COMPONENT
============================================ */
function HeroBadge() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      borderRadius: '9999px',
      border: '1px solid rgba(52, 211, 153, 0.2)',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '10px 16px',
      backdropFilter: 'blur(24px)'
    }}>
      <span className="hero-status-dot" />
      <span style={{
        fontSize: '11px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: '#6ee7b7',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        WEB3 <span style={{ opacity: 0.4, margin: '0 6px' }}>·</span> AI SECURITY
      </span>
      <style>{`
        .hero-status-dot {
          height: 6px;
          width: 6px;
          border-radius: 50%;
          background-color: #34d399;
          flex-shrink: 0;
          margin-top: 2px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

/* ============================================
   MAIN HERO COMPONENT
============================================ */
export default function SyntheticHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToAudit = () => {
    document.querySelector("#audit")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#000000',
      zIndex: 0
    }}>
      
      {/* Three.js Shader Background - Black with subtle green */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 1,
        pointerEvents: 'none',
      }}>
        {mounted && <HeroCanvas />}
      </div>

      {/* Content Container - Highest Z-Index */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pointerEvents: 'none'
      }}>
        
        {/* Inner Content - Re-enable pointer events for buttons */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 64px',
          pointerEvents: 'auto'
        }}>
          <div style={{
            maxWidth: '896px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            
            <div style={{ marginBottom: '32px' }}>
              <HeroBadge />
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'white',
              letterSpacing: '-0.025em'
            }}>
              <span style={{ whiteSpace: 'nowrap' }}>Secure Your Smart Contracts</span>
              <br />
              <span style={{
                display: 'block',
                marginTop: '8px',
                background: 'linear-gradient(to right, #34d399, #2dd4bf, #4ade80)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                with AI-Powered Audits
              </span>
            </h1>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
              <p style={{
                maxWidth: '576px',
                fontSize: '1.125rem',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center'
              }}>
                Comprehensive vulnerability detection using Slither static analysis 
                and advanced AI. Secure your DeFi protocols before deployment.
              </p>
            </div>
            {/* CTA Buttons */}
            <div style={{
              marginTop: '48px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '24px'
            }}>
              <NeonButton variant="solid" icon="zap" onClick={scrollToAudit}>
                Start Free Audit
              </NeonButton>
              <NeonButton variant="outline" icon="eye">
                View Features
              </NeonButton>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
        }}>
          <a 
            href="#audit" 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              width: '40px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.3s'
            }}
          >
            <ChevronDown style={{ height: '20px', width: '20px', color: '#34d399' }} />
          </a>
        </div>
      </div>
    </section>
  );
}
