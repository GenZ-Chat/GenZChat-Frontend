"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface ControlsBarProps {
  isAudioOff: boolean;
  isVideoOff: boolean;
  onAudioToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
}

export function ControlsBar({
  isAudioOff,
  isVideoOff,
  onAudioToggle,
  onVideoToggle,
  onEndCall,
}: ControlsBarProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-row gap-6 px-8 py-6 bg-gray-900/90 backdrop-blur-xl rounded-full shadow-xl border border-gray-800"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onAudioToggle}
          variant={isAudioOff ? "destructive" : "secondary"}
          size="lg"
          className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors
            ${isAudioOff 
              ? 'bg-red-500/90 hover:bg-red-600 text-white' 
              : 'bg-white/90 hover:bg-white text-gray-900'}`}
        >
          {isAudioOff ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onVideoToggle}
          variant={isVideoOff ? "destructive" : "secondary"}
          size="lg"
          className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors
            ${isVideoOff 
              ? 'bg-red-500/90 hover:bg-red-600 text-white' 
              : 'bg-white/90 hover:bg-white text-gray-900'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onEndCall}
          variant="destructive"
          size="lg"
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg
                     bg-red-600/90 hover:bg-red-700 text-white"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}