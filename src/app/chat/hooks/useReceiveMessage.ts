import { useEffect, useRef } from "react";
import { chatService } from "../service/chat_service";
import { ReceivedMessageModel } from "../model/receive_message_model";
import { ChatModel } from "../model/chat_model";
import { MessageComponentsProps } from "../model/message_model";
import { UserModel } from "../model/user_model";
import { base64ToUint8Array, getKeyExchangeForUser, uint8ArrayToBase64 } from "@/app/encryption/key_exchange";
import { aesEncryption } from "@/app/encryption/aes";

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
        const handleMessage = async(data: any) => {
            console.log('[RECEIVE MESSAGE] Received direct message:', data);
            const chat = chatsRef.current.find(chat => chat.id === data.chat);
            const receivedMessage:ReceivedMessageModel = ReceivedMessageModel.fromJson(data);
            
            let decryptContent: string;
            
            try {
                // Parse the encrypted content (which should be base64-encoded)
                const encryptedData = JSON.parse(receivedMessage.content);
                console.log('[RECEIVE MESSAGE] Encrypted data:', encryptedData);
                
                // Get the sender's public key for decryption
                const publicKey = Array.isArray(chat?.users) ? null : chat?.users.id === userId ? null : chat?.users.publicKey;
                
                console.log('[DECRYPTION DEBUG] Chat users info:', {
                    chatId: chat?.id,
                    chatUsers: chat?.users,
                    isArray: Array.isArray(chat?.users),
                    userId: userId,
                    senderPublicKey: publicKey
                });
                
                if (!publicKey) {
                    console.error('[RECEIVE MESSAGE] No public key found for decryption');
                    decryptContent = "[Decryption Error: No public key]";
                } else {
                    const userKeyExchange = getKeyExchangeForUser(userId!);
                    const sharedSecret = await userKeyExchange.getSharedSecret(base64ToUint8Array(publicKey));
                    
                    console.log('[DECRYPTION DEBUG] Decryption process:', {
                        receiverUserId: userId,
                        senderId: receivedMessage.sender,
                        senderPublicKey: publicKey,
                        sharedSecret: uint8ArrayToBase64(sharedSecret),
                        encryptedData: encryptedData
                    });
                    
                    // Use the new decryptFromBase64 method that handles base64-encoded data
                    decryptContent = await aesEncryption.decryptFromBase64(
                        sharedSecret, 
                        encryptedData.ciphertext, 
                        encryptedData.iv
                    );
                    console.log('[RECEIVE MESSAGE] Decrypted content:', decryptContent);
                }
            } catch (decryptError) {
                console.error('[RECEIVE MESSAGE] Decryption failed:', decryptError);
                console.error('[RECEIVE MESSAGE] Full error details:', {
                    error: decryptError,
                    receivedContent: receivedMessage.content,
                    chat: chat
                });
                decryptContent = "[Decryption Error]";
            }
               const newMessage: MessageComponentsProps = {
                            content: decryptContent,
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