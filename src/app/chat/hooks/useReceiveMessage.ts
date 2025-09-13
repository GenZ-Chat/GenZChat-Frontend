import { useEffect } from "react";
import { chatService } from "../service/chat_service";
import { ReceivedMessageModel } from "../model/receive_message_model";
import SelectedChat from "../components/selectedChat";
import { ChatModel } from "../model/chat_model";
import { MessageComponentsProps } from "../model/message_model";
import { UserModel } from "../model/user_model";

export default function useReceiveMessage(setMessageHistory: React.Dispatch<React.SetStateAction<Record<string, any[]>>>, userId: string | undefined,chats:ChatModel[]) {

    // This hook is designed to manage real-time message receiving for a user in a chat application.
    // It sets up a listener for incoming messages and updates the message history accordingly.

    useEffect(() => {
        if (!userId) return;
        if(!chatService.isConnected()){
            chatService.connect(userId);
        }

        // Function to handle incoming messages
        const handleMessage = (data: any) => {
            const chat = chats.find(chat => chat.id === data.chat);
            console.log("Received message data:", data)
            const receivedMessage:ReceivedMessageModel = ReceivedMessageModel.fromJson(data);
               const newMessage: MessageComponentsProps = {
                            content: receivedMessage.content,
                            name:  Array.isArray(chat?.users) ? chat.users.find((u:UserModel)=> u.id === receivedMessage.sender)?.name || "Unknown User" : chat?.users.name || "Unknown User",
                            sender: receivedMessage.sender,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isSender: receivedMessage.sender == userId
                        };
            console.log("New message created:", newMessage);
            // Update the message history state with the new message

            setMessageHistory((prevHistory) => {
                const updatedChatHistory = prevHistory[data.chat] ? [...prevHistory[data.chat], newMessage] : [newMessage];
                return { ...prevHistory, [data.chat]: updatedChatHistory };
            });
        };


        // Set up the message listener
        chatService.onMessage(handleMessage);

     
    }, [userId, setMessageHistory,chats]);

    return null; // This hook does not return any value
}