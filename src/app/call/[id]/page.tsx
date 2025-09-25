"use client"

import React, { useState, useEffect } from 'react'
import VideoCard from '../components/video_comp'
import { ControlsBar } from '../components/controls-bar';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSession } from 'next-auth/react';
import { chatService } from '../../chat/service/chat_service';

export default function CallPage(){
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    


    const [isAudioOff, setIsAudioOff] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const localStream = null; // Placeholder for local stream
    const remoteStream = null;

    // const userId = session?.user?.id; --- IGNORE ---
    // const peerId = params.id as string; --- IGNORE ---
    // Use WebRTC hook
    // const {
    //     localVideo,
    //     remoteVideo,
    //     localStream,
    //     remoteStream,
    //     isConnected,
    //     connectionState,
    //     isMediaInitialized,
    //     createOffer,
    //     handleOffer,
    //     handleAnswer,
    //     handleIceCandidate,
    //     endCall,
    //     initializeLocalMedia
    // } = useWebRTC(userId!, peerId);

  

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4"
        >
            {/* Connection Status */}
            <div className="absolute top-4 left-4 z-10">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    true ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                }`}>
                    {true ? 'Connected' : `Connecting... (${''})`}
                </div>
            </div>

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
                            videoRef={null}
                            isAudioOff={isAudioOff}
                            isVideoOff={isVideoOff}
                            stream={localStream}
                            isLocal={true}
                        />
                    </motion.div>
                    <motion.div variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                    }}
                    className="h-full flex items-center">
                        <VideoCard 
                            videoRef={null}
                            isAudioOff={false}
                            isVideoOff={false}
                            stream={remoteStream}
                            isLocal={false}
                        />
                    </motion.div>
                </motion.div>
                <ControlsBar 
                    isAudioOff={isAudioOff}
                    isVideoOff={isVideoOff}
                    onAudioToggle={() => setIsAudioOff((prev) => !prev)}
                    onVideoToggle={() => setIsVideoOff((prev) => !prev)}
                    onEndCall={() => {}}></ControlsBar>
            </div>
        </motion.div>
    );
}