"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface StardustButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'neon' | 'glass';
}

export const StardustButton = ({ 
  children, 
  onClick, 
  className = "",
  variant = 'neon',
  ...props 
}: StardustButtonProps) => {
  // Adaptation to Green Neon theme
  const colors = {
    neon: {
      text: 'rgba(52, 211, 153, 0.9)',
      glow: 'rgba(16, 185, 129, 0.6)',
      glowHover: 'rgba(52, 211, 153, 0.7)',
      bg: '#06120e',
      pearl: 'rgba(52, 211, 153, 0.15)'
    },
    glass: {
      text: 'rgba(52, 211, 153, 0.9)',
      glow: 'rgba(52, 211, 153, 0.2)',
      glowHover: 'rgba(52, 211, 153, 0.4)',
      bg: 'transparent',
      pearl: 'rgba(52, 211, 153, 0.05)'
    }
  };

  const currentColors = variant === 'neon' ? colors.neon : colors.glass;

  const buttonStyle = {
    '--white': '#f0fff4',
    '--bg': currentColors.bg,
    '--radius': '100px',
    '--glow': currentColors.glow,
    '--glow-hover': currentColors.glowHover,
    outline: 'none',
    cursor: 'pointer',
    border: variant === 'glass' ? '1px solid rgba(52, 211, 153, 0.4)' : 0,
    position: 'relative' as const,
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--bg)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: variant === 'neon' ? `
      inset 0 0.3rem 0.9rem rgba(52, 211, 153, 0.3),
      inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
      inset 0 -0.4rem 0.9rem rgba(52, 211, 153, 0.4),
      0 2rem 3rem rgba(0, 0, 0, 0.4),
      0 1rem 1rem -0.6rem rgba(0, 0, 0, 0.8)
    ` : 'none',
  };

  const wrapStyle = {
    fontSize: '20px',
    fontWeight: 700,
    color: currentColors.text,
    padding: '24px 40px',
    borderRadius: 'inherit',
    position: 'relative' as const,
    overflow: 'hidden',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  };

  const pStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    margin: 0,
    transition: 'all 0.3s ease',
    transform: 'translateY(2%)',
    maskImage: `linear-gradient(to bottom, ${currentColors.text} 50%, transparent)`,
  };

  const beforeAfterStyles = `
    .pearl-button .wrap::before,
    .pearl-button .wrap::after {
      content: "";
      position: absolute;
      transition: all 0.4s ease;
    }
    
    .pearl-button .wrap::before {
      left: -15%;
      right: -15%;
      bottom: 25%;
      top: -100%;
      border-radius: 50%;
      background-color: ${currentColors.pearl};
      filter: blur(10px);
    }
    
    .pearl-button .wrap::after {
      left: 6%;
      right: 6%;
      top: 12%;
      bottom: 40%;
      border-radius: 100px 100px 0 0;
      box-shadow: inset 0 10px 12px -10px ${currentColors.glow};
      background: linear-gradient(
        180deg,
        ${currentColors.glow} 0%,
        rgba(0, 0, 0, 0) 60%,
        rgba(0, 0, 0, 0) 100%
      );
    }
    
    .pearl-button:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: ${variant === 'neon' ? `
        inset 0 0.3rem 0.5rem rgba(52, 211, 153, 0.4),
        inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
        inset 0 -0.4rem 0.9rem rgba(16, 185, 129, 0.6),
        0 4rem 4rem rgba(0, 0, 0, 0.4),
        0 1.5rem 1.5rem -0.6rem rgba(0, 0, 0, 0.9)
      ` : `
        inset 0 0.3rem 0.5rem rgba(255, 255, 255, 0.2),
        inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.7),
        inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.2),
        0 4rem 4rem rgba(0, 0, 0, 0.3)
      `};
    }
    
    .pearl-button:hover .wrap::before {
      transform: translateY(-8%);
      background-color: ${variant === 'neon' ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
    }

    .pearl-button .wrap p span.sparkle {
      transition: all 0.3s ease;
    }

    .pearl-button:hover .wrap p span.sparkle {
      animation: sparkle 0.5s ease-in-out;
      color: ${variant === 'neon' ? '#34d399' : '#fff'};
    }
    
    @keyframes sparkle {
      0% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
      50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
      100% { transform: scale(1) rotate(360deg); opacity: 1; }
    }
    
    .pearl-button:hover .wrap::after {
      opacity: 0.6;
      transform: translateY(5%);
    }
    
    .pearl-button:hover .wrap p {
      transform: translateY(-4%);
      maskImage: linear-gradient(to bottom, #fff 100%, #fff);
    }
    
    .pearl-button:active {
      transform: translateY(2px) scale(0.98);
      transition: all 0.1s ease;
    }
  `;

  return (
    <>
      <style>{beforeAfterStyles}</style>
      <button
        className={cn("pearl-button group", className)}
        style={buttonStyle}
        onClick={onClick}
        {...props}
      >
        <div className="wrap" style={wrapStyle}>
          <div style={pStyle}>
            <span className="sparkle text-xl">✦</span>
            {children}
          </div>
        </div>
      </button>
    </>
  );
};
