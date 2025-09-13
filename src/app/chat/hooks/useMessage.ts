import {useEffect, useState } from "react";
import { messageService } from "../service/message_service";


export default function useMessageHistory(userId: string | null,chats:any) {
    // This hook is designed to manage message history for a user in a chat application.
    const [messageHistory, setMessageHistory] = useState<any>({});

    useEffect(() => {
        const fetchMessageHistory = async () => {
            if(userId === null) return;
            // Initialize message service with user ID
            await messageService.setUserId(userId);
            const history = await messageService.getMessages();
            setMessageHistory(history);
        };

        fetchMessageHistory();
    }, [userId,chats]);

    return {messageHistory,setMessageHistory};
}
