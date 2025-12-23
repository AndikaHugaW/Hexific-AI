'use client';

import { Zap, Eye } from "lucide-react";

interface HeroButtonsProps {
  onAuditClick?: () => void;
  onFeaturesClick?: () => void;
}

export function HeroButtons({ onAuditClick, onFeaturesClick }: HeroButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
      
      {/* PRIMARY BUTTON: Start Free Audit */}
      {/* Menggunakan warna hitam pekat agar "pop-out" di background hijau terang */}
      <button 
        onClick={onAuditClick}
        className="group relative flex items-center gap-2 px-8 py-3.5 bg-slate-950 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-slate-800"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Zap className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 fill-current" />
        <span className="relative z-10">Start Free Audit</span>
      </button>

      {/* SECONDARY BUTTON: View Features */}
      {/* Menggunakan Glassmorphism agar menyatu dengan background tapi tetap terbaca */}
      <button 
        onClick={onFeaturesClick}
        className="flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-medium transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105"
      >
        <Eye className="w-5 h-5 text-emerald-100" />
        <span>View Features</span>
      </button>

    </div>
  );
}
