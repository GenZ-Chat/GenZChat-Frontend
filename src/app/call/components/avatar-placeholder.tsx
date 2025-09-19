"use client";

import { motion } from "framer-motion";

interface AvatarPlaceholderProps {
  initials?: string;
}

export function AvatarPlaceholder({ initials = "U" }: AvatarPlaceholderProps) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 
                 flex items-center justify-center text-4xl font-semibold text-white
                 shadow-lg"
    >
      <motion.span
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        {initials}
      </motion.span>
    </motion.div>
  );
}