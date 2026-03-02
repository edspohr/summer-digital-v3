'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeToDismissProps {
  children: React.ReactNode;
  onDismiss: () => void;
  className?: string;
}

export function SwipeToDismiss({ children, onDismiss, className }: SwipeToDismissProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onDismiss();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, opacity, scale }}
      onDragEnd={handleDragEnd}
      className={className}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {children}
    </motion.div>
  );
}
