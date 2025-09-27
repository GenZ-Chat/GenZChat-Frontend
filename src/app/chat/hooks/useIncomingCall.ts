import { useEffect, useState } from "react";
import { chatService } from "../service/chat_service";
import { ChatModel } from "../model/chat_model";

export default function useIncomingCall(userId: string | undefined, chats: ChatModel[]) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [callerName, setCallerName] = useState<string | undefined>(undefined);
    const [roomId, setRoomId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!userId) return;

        const handleIncomingCall = (callData: any) => {
            console.log('[useIncomingCall] Received incoming call:', callData);
            
            // Find the caller's name from chats
            const callerChat = chats.find(chat => 
                Array.isArray(chat.users) 
                    ? chat.users.some(user => user.id === callData.callerId)
                    : chat.users.id === callData.callerId
            );
            
            const name = callerChat 
                ? Array.isArray(callerChat.users) 
                    ? callerChat.users.find(user => user.id === callData.callerId)?.name || "Unknown Caller"
                    : callerChat.users.name || "Unknown Caller"
                : "Unknown Caller";
            
            setCallerName(name);
            setDialogOpen(true);
            setRoomId(callData.roomId);
            console.log('[useIncomingCall] Caller name set to:', name);
        };

        chatService.onRecieveCall(handleIncomingCall);

 
    }, [userId, chats]);

    return {
        dialogOpen,
        roomId,
        setDialogOpen,
        callerName,
        setCallerName
    };
}