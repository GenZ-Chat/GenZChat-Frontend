import {useEffect, useState } from "react";
import { messageService } from "../service/message_service";
import { getKeyExchangeForUser, base64ToUint8Array, uint8ArrayToBase64 } from "@/app/encryption/key_exchange";
import { aesEncryption } from "@/app/encryption/aes";
import { ChatModel, ChatType } from "../model/chat_model";


export default function useMessageHistory(userId: string | null, chats: ChatModel[]) {
    // This hook is designed to manage message history for a user in a chat application.
    const [messageHistory, setMessageHistory] = useState<any>({});

    const decryptMessageHistory = async (rawHistory: any, userId: string, chats: ChatModel[]) => {
        console.log('[MESSAGE HISTORY] Starting decryption process...');
        const decryptedHistory: any = {};
        
        for (const chatId in rawHistory) {
            const messages = rawHistory[chatId];
            const chat = chats.find(c => c.id === chatId);
            
            if (!chat) {
                console.warn(`[MESSAGE HISTORY] Chat ${chatId} not found in chats list`);
                decryptedHistory[chatId] = messages;
                continue;
            }
            
            decryptedHistory[chatId] = await Promise.all(
                messages.map(async (message: any) => {
                    try {
                        // Only decrypt direct messages that are encrypted
                        if (chat.type === ChatType.DIRECT && 
                            !Array.isArray(chat.users) && 
                            message.content && 
                            typeof message.content === 'string' && 
                            message.content.startsWith('{')) {
                            
                            console.log(`[MESSAGE HISTORY] Decrypting message in chat ${chatId}`);
                            
                            // Parse encrypted content
                            const encryptedData = JSON.parse(message.content);
                            
                            // Get the correct public key based on who sent the message
                            let publicKey: string | null = null;
                            if (message.sender === userId) {
                                // If we sent the message, use the receiver's public key
                                publicKey = chat.users.publicKey || null;
                            } else {
                                // If we received the message, use the sender's public key
                                publicKey = chat.users.publicKey || null;
                            }
                            
                            if (publicKey && encryptedData.ciphertext && encryptedData.iv) {
                                const userKeyExchange = getKeyExchangeForUser(userId);
                                const sharedSecret = await userKeyExchange.getSharedSecret(base64ToUint8Array(publicKey));
                                
                                const decryptedContent = await aesEncryption.decryptFromBase64(
                                    sharedSecret,
                                    encryptedData.ciphertext,
                                    encryptedData.iv
                                );
                                
                                console.log(`[MESSAGE HISTORY] Successfully decrypted message: ${decryptedContent}`);
                                
                                return {
                                    ...message,
                                    content: decryptedContent
                                };
                            } else {
                                console.warn(`[MESSAGE HISTORY] Missing decryption data for message in chat ${chatId}`);
                                return {
                                    ...message,
                                    content: '[Decryption Error: Missing data]'
                                };
                            }
                        } else {
                            // Group messages or unencrypted messages - return as is
                            return message;
                        }
                    } catch (error) {
                        console.error(`[MESSAGE HISTORY] Decryption failed for message in chat ${chatId}:`, error);
                        return {
                            ...message,
                            content: '[Decryption Error]'
                        };
                    }
                })
            );
        }
        
        console.log('[MESSAGE HISTORY] Decryption process completed');
        return decryptedHistory;
    };

    useEffect(() => {
        const fetchMessageHistory = async () => {
            if(userId === null) return;
            // Initialize message service with user ID
            await messageService.setUserId(userId);
            const rawHistory = await messageService.getMessages();
            
            console.log('[MESSAGE HISTORY] Raw history received:', rawHistory);
            
            // Decrypt the message history
            const decryptedHistory = await decryptMessageHistory(rawHistory, userId, chats);
            
            console.log('[MESSAGE HISTORY] Decrypted history:', decryptedHistory);
            setMessageHistory(decryptedHistory);
        };

        fetchMessageHistory();
    }, [userId, chats]);

    return {messageHistory, setMessageHistory};
}
