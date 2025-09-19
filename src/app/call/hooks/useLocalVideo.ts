import { useEffect, useRef, useState } from "react";

export default function useLocalVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream|null>(null);

    useEffect(() => {

        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                if (videoRef.current) {
                    setStream(stream);
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        initCamera();
    }, []);
    return {videoRef,stream};
}