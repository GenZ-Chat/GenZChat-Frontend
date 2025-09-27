"use client"

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
// Helper function to generate random ID
function randomID(len: number = 5): string {
  let result = '';
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  const maxPos = chars.length;
  
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export default function CallPage(): React.JSX.Element {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Get room ID from URL params
    const roomID: string = Array.isArray(params.id) ? params.id[0] : params.id || '';

    const initializeMeeting = async (): Promise<void> => {
        if (!containerRef.current || !session?.user) return;

        // Generate Kit Token
        const appID: number = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
        const serverSecret: string = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';
        
        if (!appID || !serverSecret) {
            console.error('ZEGO credentials not found');
            return;
        }

        const userID: string = session.user.id || randomID(5);
        const userName: string = session.user.name || randomID(5);

        const kitToken: string = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            roomID, 
            userID, 
            userName
        );

        // Create instance object from Kit Token
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        // Start the call
        zp.joinRoom({
            container: containerRef.current,
            sharedLinks: [
                {
                    name: 'Personal link',
                    url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
                },
            ],
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference,
            },
        });
    };

    useEffect(() => {
        if (session && roomID) {
            initializeMeeting();
        }
    }, [session, roomID]);

    return (
        <div
            className="myCallContainer"
            ref={containerRef}
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}