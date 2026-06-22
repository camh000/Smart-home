"use client";

import { useEffect } from "react";
import { useMotionValue, useTransform, animate, motion } from "motion/react";

export function AnimatedNumber({
  value,
  prefix = "£",
  className,
}: {
  value: number;
  prefix?: string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) =>
    prefix + Math.round(v).toLocaleString("en-GB"),
  );

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    });
    return controls.stop;
  }, [value, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
