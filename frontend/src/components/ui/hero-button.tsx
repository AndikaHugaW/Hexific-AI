"use client";

import * as React from "react";

interface HeroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export function HeroButton({ 
  children, 
  onClick, 
  variant = "primary",
  className = ""
}: HeroButtonProps) {
  
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    px-8 py-4 
    rounded-full
    font-semibold text-base
    transition-all duration-300 ease-out
    cursor-pointer
    outline-none
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500
      text-gray-900
      border-0
      hover:from-emerald-400 hover:via-emerald-300 hover:to-emerald-400
      hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    secondary: `
      bg-transparent
      text-emerald-400
      border border-emerald-500/40
      hover:border-emerald-400
      hover:bg-emerald-500/10
      hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]
      hover:-translate-y-0.5
      active:translate-y-0
    `
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
