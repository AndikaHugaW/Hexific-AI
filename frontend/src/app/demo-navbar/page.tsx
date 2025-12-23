"use client"

import { Home, User, Briefcase, FileText, Shield, Code } from 'lucide-react'
import { NavBar } from "@/components/ui/tube-light-navbar"

export default function TubeLightNavbarDemo() {
    const navItems = [
        { name: 'Home', url: '/', icon: Home },
        { name: 'Features', url: '#features', icon: Code },
        { name: 'Pricing', url: '#pricing', icon: Briefcase },
        { name: 'Docs', url: '/docs', icon: FileText }
    ]

    return (
        <div className="min-h-screen bg-black">
            <NavBar items={navItems} />
            <div className="preview flex min-h-screen w-full justify-center p-10 items-center">
                <div className="relative w-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-white">Tube Light Navbar Demo</h1>
                        <p className="text-white/80">
                            The Navbar will show at top of the page with animated tube light effect
                        </p>
                        <p className="text-emerald-400 text-sm">
                            Click on different tabs to see the animation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
