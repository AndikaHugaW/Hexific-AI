import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-full border",
    "backdrop-blur-md",
    "font-medium uppercase",
    "transition-all duration-300",
    "select-none whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.06]",

        secondary:
          "border-violet-400/30 bg-violet-400/10 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]",

        accent:
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.25)]",

        destructive:
          "border-red-400/30 bg-red-400/10 text-red-300 shadow-[0_0_12px_rgba(248,113,113,0.25)]",

        outline:
          "border-white/25 bg-transparent text-white/80",
      },

      size: {
        sm: "px-3 py-1 text-[10px] tracking-[0.18em]",
        default: "px-4 py-1.5 text-[11px] tracking-[0.22em]",
        lg: "px-6 py-2 text-[12px] tracking-[0.28em]",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
