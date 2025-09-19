"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AvatarPlaceholder } from "./avatar-placeholder";
import { MuteBadge } from "./mute-badge";

export default function VideoCard({
  videoRef,
  isAudioOff,
  isVideoOff,
  stream,
  isLocal,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isAudioOff: boolean;
  isVideoOff: boolean;
  stream: MediaStream | null;
  isLocal?: boolean;
}) {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    if(isLocal){    
      // Turn on video
      stream?.getVideoTracks().forEach(track => track.enabled = !isVideoOff);

      // Same for audio
      stream?.getAudioTracks().forEach(track => track.enabled = !isAudioOff);
    } 
  }, [stream, videoRef, isAudioOff, isVideoOff]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="w-full h-full flex items-center justify-center"
    >
      <Card className="relative w-full h-full max-h-[calc(100vh-180px)] overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-gray-900 to-black border-0">
        <CardContent className="absolute inset-0 p-0 rounded-2xl">
          {!isVideoOff ? (
            <motion.video
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              ref={videoRef}
              autoPlay
              playsInline
              muted={isLocal}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <AvatarPlaceholder initials={isLocal ? "You" : "U"} />
            </div>
          )}
        </CardContent>

        {/* Status badges */}
        <MuteBadge type="audio" show={isAudioOff} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm 
                     px-2 py-1 rounded-lg text-xs text-white font-medium"
        >
          {isLocal ? "You" : "Remote User"}
        </motion.div>
      </Card>
    </motion.div>
  );
}
