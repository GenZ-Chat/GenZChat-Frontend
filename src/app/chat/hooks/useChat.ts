import { useEffect, useState } from "react";
import { userService } from "../service/user_service";
import { ChatModel } from "../model/chat_model";

 function useChat(userId:string){
    const [chats, setChats] = useState<ChatModel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChats = async () => {
            if (!userId) return;
            try {
                setIsLoading(true);
                await userService.setUserId(userId);
                const fetchedChats = await userService.getChats();
                setChats(fetchedChats);
                console.log("Fetched chats:", fetchedChats);
            } catch (error) {
                console.error("Error fetching chats:", error);
                setError("Failed to fetch chats. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChats();
    }, [userId, userService]);
    return { chats, isLoading, error };
}

// Exporting the hook for use in other components
export default useChat;