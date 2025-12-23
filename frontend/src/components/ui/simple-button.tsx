'use client';

import { Zap, Eye } from 'lucide-react';

interface SimpleButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function SimpleButton({ 
  children, 
  variant = 'primary', 
  onClick 
}: SimpleButtonProps) {
  
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    px-8 py-4
    rounded-full
    text-base font-semibold
    transition-all duration-300
    cursor-pointer
    outline-none
    border-2
  `;
  
  const variants = {
    primary: `
      bg-emerald-500 
      border-emerald-500
      text-gray-900
      hover:bg-emerald-400 
      hover:border-emerald-400
      hover:shadow-lg hover:shadow-emerald-500/30
      active:scale-95
    `,
    secondary: `
      bg-transparent 
      border-emerald-500/50
      text-emerald-400
      hover:bg-emerald-500/10 
      hover:border-emerald-400
      hover:shadow-lg hover:shadow-emerald-500/20
      active:scale-95
    `
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

// Pre-built hero buttons
export function StartAuditButton({ onClick }: { onClick?: () => void }) {
  return (
    <SimpleButton variant="primary" onClick={onClick}>
      <Zap className="w-5 h-5" />
      Start Free Audit
    </SimpleButton>
  );
}

export function ViewFeaturesButton({ onClick }: { onClick?: () => void }) {
  return (
    <SimpleButton variant="secondary" onClick={onClick}>
      <Eye className="w-5 h-5" />
      View Features
    </SimpleButton>
  );
}
