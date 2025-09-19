export type Participant = {
    id: string;
    name: string;
    stream: MediaStream | null;
    isAudioOff: boolean;
    isVideoOff: boolean;
};