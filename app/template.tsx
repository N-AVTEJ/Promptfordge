"use client";

import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex-1 flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
}
