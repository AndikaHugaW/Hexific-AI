"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
}

export function NavBar({ items, className }: NavBarProps) {
    const [activeTab, setActiveTab] = useState(items[0].name)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div
            className={cn(
                "fixed top-0 left-1/2 -translate-x-1/2 z-[200] pt-6 h-max w-full max-w-2xl px-4",
                className,
            )}
        >
            <div className="flex items-center justify-center gap-1 bg-black/60 border border-emerald-500/20 backdrop-blur-xl py-1.5 px-1.5 rounded-full shadow-lg shadow-emerald-500/10">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <Link
                            key={item.name}
                            href={item.url}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "relative cursor-pointer text-base font-semibold px-8 py-3 rounded-full transition-all duration-200 flex-1 text-center",
                                isActive 
                                    ? "text-white" 
                                    : "text-gray-400 hover:text-emerald-400",
                            )}
                        >
                            <span className="hidden md:inline relative z-10">{item.name}</span>
                            <span className="md:hidden relative z-10">
                                <Icon size={20} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full bg-emerald-500/20 rounded-full -z-0 border border-emerald-500/30"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-emerald-500 rounded-t-full">
                                        <div className="absolute w-16 h-8 bg-emerald-500/40 rounded-full blur-lg -top-3 -left-3" />
                                        <div className="absolute w-12 h-6 bg-emerald-500/50 rounded-full blur-md -top-2" />
                                        <div className="absolute w-6 h-6 bg-emerald-500/60 rounded-full blur-sm top-0 left-2" />
                                    </div>
                                </motion.div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
