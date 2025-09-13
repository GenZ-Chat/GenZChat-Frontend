"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { CallService } from "../chat/service/call_service";

export default function CallPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const roomId = searchParams.get('roomId');
    const remoteUserId = searchParams.get('userId');

    // Media state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for video elements and service
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const callServiceRef = useRef<CallService | null>(null);

    useEffect(() => {
        if (!roomId || !remoteUserId || !session?.user?.id) {
            setError("Missing required call parameters");
            return;
        }

        // Initialize call
        const initCall = async () => {
            try {
                const callService = new CallService(roomId, session?.user?.id!);
                callServiceRef.current = callService;

                // Get local stream
                const localStream = await callService.initLocalStream();
                if (localVideoRef.current && localStream) {
                    localVideoRef.current.srcObject = localStream;
                }

                // Watch for remote stream
                const checkRemoteStream = setInterval(() => {
                    const remoteStreams = callService.getRemoteStream();
                    const remoteStream = remoteStreams[remoteUserId];
                    if (remoteStream && remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                        setIsConnected(true);
                        clearInterval(checkRemoteStream);
                    }
                }, 1000);

                return () => {
                    clearInterval(checkRemoteStream);
                    callService.cleanup();
                };
            } catch (err: any) {
                setError(err.message || "Failed to initialize call");
                console.error("Call initialization error:", err);
            }
        };

        initCall();

        // Cleanup on unmount
        return () => {
            if (callServiceRef.current) {
                callServiceRef.current.cleanup();
            }
        };
    }, [roomId, remoteUserId, session?.user?.id]);

    const toggleMute = () => {
        if (callServiceRef.current) {
            callServiceRef.current.enableAudio(!isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (callServiceRef.current) {
            callServiceRef.current.enableVideo(!isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    const endCall = () => {
        if (callServiceRef.current) {
            callServiceRef.current.cleanup();
        }
        router.push('/home');
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <div className="text-destructive mb-4">Error: {error}</div>
                <Button variant="default" onClick={() => router.push('/home')}>
                    Return Home
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Video Grid */}
            <div className="flex-1 grid grid-cols-2 gap-4 p-4">
                {/* Local Video */}
                <div className="relative">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover rounded-lg bg-black"
                    />
                    <div className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                        You
                    </div>
                </div>

                {/* Remote Video */}
                <div className="relative">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover rounded-lg bg-black"
                    />
                    <div className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                        {isConnected ? 'Remote User' : 'Connecting...'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 p-4 bg-background border-t">
                <Button
                    variant={isMuted ? "destructive" : "default"}
                    size="icon"
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={endCall}
                >
                    <PhoneOff />
                </Button>
                <Button
                    variant={isVideoOff ? "destructive" : "default"}
                    size="icon"
                    onClick={toggleVideo}
                >
                    {isVideoOff ? <VideoOff /> : <Video />}
                </Button>
            </div>
        </div>
    );
}