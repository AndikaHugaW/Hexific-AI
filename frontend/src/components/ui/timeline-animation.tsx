"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, RefObject, useMemo } from "react";

interface TimelineContentProps {
  children: ReactNode;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | HTMLDivElement | null>;
  customVariants?: any;
  className?: string;
  as?: React.ElementType;
}

export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className = "",
  as: Component = "div",
}: TimelineContentProps) {
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"],
  });

  const defaultVariants = useMemo(
    () => ({
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.3,
          duration: 0.6,
        },
      }),
      hidden: {
        opacity: 0,
        y: 50,
      },
    }),
    []
  );

  const variants = customVariants || defaultVariants;

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [100, 0, 0, -100]
  );

  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={variants}
      className={className}
      style={{ opacity, y }}
      // @ts-ignore
      as={Component}
    >
      {children}
    </motion.div>
  );
}
