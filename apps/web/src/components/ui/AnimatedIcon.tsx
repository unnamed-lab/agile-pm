"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { LucideIcon } from "lucide-react";

export type AnimationType = "hover-scale" | "hover-bounce" | "hover-rotate" | "pulse" | "spin";

interface AnimatedIconProps {
  icon: LucideIcon;
  animation?: AnimationType;
  className?: string;
  size?: number;
}

export function AnimatedIcon({
  icon: Icon,
  animation = "hover-scale",
  className = "",
  size = 18,
}: AnimatedIconProps) {
  const getMotionVariants = (): Variants => {
    switch (animation) {
      case "hover-bounce":
        return {
          hover: { y: -2, scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 10 } },
        };
      case "hover-rotate":
        return {
          hover: { rotate: 15, scale: 1.1, transition: { type: "spring", stiffness: 300 } },
        };
      case "pulse":
        return {
          hover: { scale: 1.15, transition: { duration: 0.2 } },
          animate: { opacity: [1, 0.6, 1], transition: { repeat: Infinity, duration: 2 } },
        };
      case "spin":
        return {
          animate: { rotate: 360, transition: { repeat: Infinity, duration: 1.5, ease: "linear" } },
        };
      case "hover-scale":
      default:
        return {
          hover: { scale: 1.12, transition: { type: "spring", stiffness: 400, damping: 15 } },
        };
    }
  };

  return (
    <motion.span
      className="inline-flex items-center justify-center shrink-0"
      whileHover="hover"
      animate="animate"
      variants={getMotionVariants()}
    >
      <Icon className={className} size={size} />
    </motion.span>
  );
}
