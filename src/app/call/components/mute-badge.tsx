"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface MuteBadgeProps {
  type: "audio" | "video";
  show: boolean;
}

export function MuteBadge({ type, show }: MuteBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm 
                 p-2 rounded-full shadow-lg"
    >
      {type === "audio" ? (
        show ? <MicOff size={18} className="text-red-500" /> : <Mic size={18} className="text-green-500" />
      ) : (
        show ? <VideoOff size={18} className="text-red-500" /> : <Video size={18} className="text-green-500" />
      )}
    </motion.div>
  );
}