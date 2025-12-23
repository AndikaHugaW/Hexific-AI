'use client';

import React from 'react';

interface GradientButtonProps {
  children?: React.ReactNode;
  width?: string;
  height?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const GradientButton = ({
  children,
  width = '180px',
  height = '44px',
  onClick,
  disabled = false,
  className = '',
}: GradientButtonProps) => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <>
      <style>{`
        .gradient-btn-wrapper {
          position: relative;
          border-radius: 9999px;
          padding: 2px;
          background: conic-gradient(
            from var(--gradient-angle, 0deg),
            #10b981,
            #34d399,
            #6ee7b7,
            #34d399,
            #10b981
          );
          animation: rotateGradientBorder 3s linear infinite;
        }
        
        .gradient-btn-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: inherit;
          filter: blur(8px);
          opacity: 0.6;
          z-index: -1;
        }
        
        .gradient-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 9999px;
          background: #0a0a0f;
          color: #f8fafc;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.02em;
          cursor: pointer;
          border: none;
          outline: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .gradient-btn-inner:hover {
          background: #111118;
          transform: scale(1.02);
        }
        
        .gradient-btn-inner:active {
          transform: scale(0.98);
        }
        
        .gradient-btn-inner:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @property --gradient-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        
        @keyframes rotateGradientBorder {
          0% {
            --gradient-angle: 0deg;
          }
          100% {
            --gradient-angle: 360deg;
          }
        }
      `}</style>
      
      <div 
        className={`gradient-btn-wrapper ${className}`}
        style={{ width, height }}
      >
        <button
          className="gradient-btn-inner"
          style={{ width: '100%', height: '100%' }}
          onClick={disabled ? undefined : onClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {children}
        </button>
      </div>
    </>
  );
};

export default GradientButton;
