"use client"

import React, { useState } from 'react'
import VideoCard from './components/video_comp'
import useLocalVideo from './hooks/useLocalVideo';
import { Participant } from './model/participant';
import { ControlsBar } from './components/controls-bar';
import { motion } from 'framer-motion';

export default function CallPage(){
    const [isAudioOff, setIsAudioOff] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);

    const {videoRef, stream} = useLocalVideo();
    const remoteVideoRef = React.useRef<HTMLVideoElement|null>(null);

    const handleEndCall = () => {
        // Add your end call logic here
        console.log("Call ended");
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4"
        >
            <div className="h-[calc(100vh-2rem)] flex flex-col items-center justify-center">
                <motion.div 
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 px-4 md:px-8 lg:px-16"
                    style={{ height: 'calc(100vh - 160px)' }}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                    }}
                    className="h-full flex items-center">
                        <VideoCard 
                            videoRef={videoRef}
                            isAudioOff={isAudioOff}
                            isVideoOff={isVideoOff}
                            stream={stream}
                            isLocal={true}
                        />
                    </motion.div>
                    <motion.div variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                    }}
                    className="h-full flex items-center">
                        <VideoCard 
                            videoRef={remoteVideoRef}
                            isAudioOff={participants[0]?.isAudioOff}
                            isVideoOff={participants[0]?.isVideoOff}
                            stream={participants[0]?.stream}
                            isLocal={false}
                        />
                    </motion.div>
                </motion.div>

                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                    <ControlsBar 
                        isAudioOff={isAudioOff}
                        isVideoOff={isVideoOff}
                        onAudioToggle={() => setIsAudioOff(!isAudioOff)}
                        onVideoToggle={() => setIsVideoOff(!isVideoOff)}
                        onEndCall={handleEndCall}
                    />
                </div>
            </div>
        </motion.div>
    )
}