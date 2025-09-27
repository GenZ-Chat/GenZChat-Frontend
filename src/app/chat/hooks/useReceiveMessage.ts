import { useEffect, useRef } from "react";
import { chatService } from "../service/chat_service";
import { ReceivedMessageModel } from "../model/receive_message_model";
import { ChatModel } from "../model/chat_model";
import { MessageComponentsProps } from "../model/message_model";
import { UserModel } from "../model/user_model";

export default function useReceiveMessage(setMessageHistory: React.Dispatch<React.SetStateAction<Record<string, any[]>>>, userId: string | undefined,chats:ChatModel[]) {

    // This hook is designed to manage real-time message receiving for a user in a chat application.
    // It sets up a listener for incoming messages and updates the message history accordingly.
    
    // Use ref to access latest chats without triggering effect re-runs
    const chatsRef = useRef(chats);
    chatsRef.current = chats;

    useEffect(() => {
        if (!userId) return;
        
        // Only connect if not already connected
        if(!chatService.isConnected()){
            chatService.connect(userId);
        }

        // Function to handle incoming messages
        const handleMessage = (data: any) => {
            console.log('[RECEIVE MESSAGE] Received direct message:', data);
            const chat = chatsRef.current.find(chat => chat.id === data.chat);
            const receivedMessage:ReceivedMessageModel = ReceivedMessageModel.fromJson(data);
               const newMessage: MessageComponentsProps = {
                            content: receivedMessage.content,
                            name:  Array.isArray(chat?.users) ? chat.users.find((u:UserModel)=> u.id === receivedMessage.sender)?.name || "Unknown User" : chat?.users.name || "Unknown User",
                            sender: receivedMessage.sender,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isSender: receivedMessage.sender == userId,
                            attachments: receivedMessage.attachments || []
                        };

            console.log('[RECEIVE MESSAGE] Processed message:', newMessage);
            setMessageHistory((prevHistory) => {
                const chatHistory = prevHistory[data.chat] || [];
                
                // If this is our own message, check if we already have a similar message from the last few seconds
                if (receivedMessage.sender === userId) {
                    const recentMessages = chatHistory.slice(-5); // Check last 5 messages
                    const isDuplicate = recentMessages.some(msg => 
                        msg.content === newMessage.content && 
                        msg.sender === newMessage.sender &&
                        msg.attachments?.length === newMessage.attachments?.length
                    );
                    
                    if (isDuplicate) {
                        console.log('[RECEIVE MESSAGE] Skipping duplicate sent message');
                        return prevHistory;
                    }
                }
                
                const updatedChatHistory = [...chatHistory, newMessage];
                console.log('[RECEIVE MESSAGE] Updated message history for chat', data.chat, updatedChatHistory);
                return { ...prevHistory, [data.chat]: updatedChatHistory };
            });
        };

        const handleGroupMessage = (data: any) => {
            console.log('[RECEIVE MESSAGE] Received group message:', data);
            const chat = chatsRef.current.find(chat => chat.id === data.chat);
            const receivedMessage:ReceivedMessageModel = ReceivedMessageModel.fromJson(data);
               const newMessage: MessageComponentsProps = {
                            content: receivedMessage.content,
                            name:  Array.isArray(chat?.users) ? chat.users.find((u:UserModel)=> u.id === receivedMessage.sender)?.name || "Unknown User" : chat?.users.name || "Unknown User",
                            sender: receivedMessage.sender,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isSender: receivedMessage.sender == userId,
                            attachments: receivedMessage.attachments || []
                        };

            console.log('[RECEIVE MESSAGE] Processed group message:', newMessage);
            setMessageHistory((prevHistory) => {
                const chatHistory = prevHistory[data.chat] || [];
                
                // If this is our own message, check if we already have a similar message from the last few seconds
                if (receivedMessage.sender === userId) {
                    const recentMessages = chatHistory.slice(-5); // Check last 5 messages
                    const isDuplicate = recentMessages.some(msg => 
                        msg.content === newMessage.content && 
                        msg.sender === newMessage.sender &&
                        msg.attachments?.length === newMessage.attachments?.length
                    );
                    
                    if (isDuplicate) {
                        console.log('[RECEIVE MESSAGE] Skipping duplicate sent group message');
                        return prevHistory;
                    }
                }
                
                const updatedChatHistory = [...chatHistory, newMessage];
                console.log('[RECEIVE MESSAGE] Updated message history for group chat', data.chat, updatedChatHistory);
                return { ...prevHistory, [data.chat]: updatedChatHistory };
            });
        }


        // Set up the message listener
        console.log('[RECEIVE MESSAGE] Setting up message listeners');
        chatService.onMessage(handleMessage);
        chatService.receiveGroupMessage(handleGroupMessage);

        return () => {
            console.log('[RECEIVE MESSAGE] Cleaning up message listeners');
            chatService.offMessage();
            chatService.offGroupMessage(handleGroupMessage);
        }
     
    }, [userId]);

    return null; // This hook does not return any value
}