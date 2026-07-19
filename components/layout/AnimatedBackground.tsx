"use client";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-charcoal-950">
      <div className="absolute inset-0 blueprint-grid opacity-60" />
      <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-racing-red/10 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-neon-blue/10 blur-[120px]" />
      <motion.div
        className="absolute bottom-0 left-0 h-1 w-full racetrack-line opacity-30"
        animate={{ backgroundPositionX: [0, 48] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-charcoal-950" />
    </div>
  );
}
