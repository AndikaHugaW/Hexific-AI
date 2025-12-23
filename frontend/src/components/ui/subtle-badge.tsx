'use client'
import React, { useState } from 'react'
import { cn } from "@/lib/utils"

interface SubtleBadgeProps {
  label: string;
  text: string;
  className?: string;
}

export const SubtleBadge = ({ label, text, className }: SubtleBadgeProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div 
      className={cn(
        'group relative border-2 flex justify-center items-center gap-8 border-emerald-500/20 rounded-full px-32 py-10 transition-all duration-500 ease-out hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] overflow-hidden backdrop-blur-md cursor-default select-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-emerald-400/5 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {/* Subtle glow effect */}
      <div className='absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
      
      {/* Text */}
      <span className='text-white font-bold tracking-[0.4em] text-[9px] uppercase transition-all duration-300 group-hover:text-emerald-50 relative z-10'>
        {label} <span className="opacity-30 mx-1">·</span> {text}
      </span>
      
      {/* Animated dot */}
      <span className={cn(
        "relative z-10 w-2.5 h-2.5 bg-emerald-400 rounded-full transition-all duration-500 ease-out",
        isHovered && "bg-emerald-300 shadow-lg shadow-emerald-400/50 scale-110",
        isPressed && "scale-90",
        "before:absolute before:inset-0 before:bg-emerald-400 before:rounded-full before:animate-pulse before:opacity-0 group-hover:before:opacity-30"
      )}>
        {/* Ripple effect */}
        <div className='absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-0 group-hover:opacity-75'
             style={{ animationDuration: '2s' }}></div>
      </span>
      
      {/* Hover state border animation */}
      <div className='absolute inset-0 rounded-full border-2 border-emerald-400/0 group-hover:border-emerald-400/30 transition-all duration-500 animate-pulse opacity-0 group-hover:opacity-100'></div>
    </div>
  )
}
