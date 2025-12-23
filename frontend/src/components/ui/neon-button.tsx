"use client";

import React from 'react';
import { Zap, Eye } from 'lucide-react';

interface NeonButtonProps {
  children: React.ReactNode;
  variant?: 'solid' | 'outline';
  icon?: 'zap' | 'eye';
  onClick?: () => void;
}

export function NeonButton({ 
  children, 
  variant = 'solid', 
  icon,
  onClick 
}: NeonButtonProps) {
  
  const [isHovered, setIsHovered] = React.useState(false);

  const getStyle = (): React.CSSProperties => {
    if (variant === 'solid') {
      return {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 32px',
        borderRadius: '9999px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none',
        overflow: 'hidden',
        backgroundColor: isHovered ? '#059669' : '#10b981',
        color: '#030308',
        borderWidth: '0px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        boxShadow: isHovered ? '0 0 30px rgba(52, 211, 153, 0.5)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      };
    } else {
      return {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px 32px',
        borderRadius: '9999px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none',
        overflow: 'hidden',
        backgroundColor: isHovered ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
        color: '#34d399',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isHovered ? '#34d399' : 'rgba(52, 211, 153, 0.4)',
        boxShadow: isHovered ? '0 0 20px rgba(52, 211, 153, 0.3)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      };
    }
  };

  const IconComponent = icon === 'zap' ? Zap : icon === 'eye' ? Eye : null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getStyle()}
    >
      {/* Neon line top */}
      <span style={{
        position: 'absolute',
        top: 0,
        left: '12.5%',
        right: '12.5%',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #34d399, transparent)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }} />
      
      {/* Icon */}
      {IconComponent && <IconComponent size={20} />}
      
      {/* Text */}
      {children}
      
      {/* Neon line bottom */}
      <span style={{
        position: 'absolute',
        bottom: 0,
        left: '12.5%',
        right: '12.5%',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #34d399, transparent)',
        opacity: isHovered ? 0.5 : 0,
        transition: 'opacity 0.5s ease'
      }} />
    </button>
  );
}
