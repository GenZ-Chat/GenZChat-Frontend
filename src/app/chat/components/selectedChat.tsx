import { SidebarTrigger } from "@/components/ui/sidebar"
import { SentMessageComponent } from "./sent_msg_component"
import { ReceiveMsgComponent } from "./recvieve_msg_component"
import { MessageComponentsProps } from "../model/message_model";
import { ChatModel } from "../model/chat_model";
import { UserModel } from "../model/user_model";

export default function SelectedChat({chat, messages,userId}: {chat: ChatModel | undefined, messages: {[key: string]: MessageComponentsProps[]}, userId: string | undefined}) {
    
    const chatId = chat?.id;
    // Early return if chatId is not available
    if (!chatId || !messages[chatId]) {
        return (
            <div className="flex-1 p-4 overflow-y-auto">
                <SidebarTrigger />
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-2">Welcome to GenZChat</h3>
                    <p className="text-muted-foreground">Select a friend to start chatting</p>
                </div>
            </div>
        );
    }

    // Safe to access messages[chatId] now
    console.log('[SELECTED CHAT] Raw messages for chat:', chatId, messages[chatId]);
    const selectedChatMessage = messages[chatId].map((msg) => {
        const processedMsg = {
            ...msg,
            name: Array.isArray(chat?.users) ? chat.users.find((u:UserModel)=> u.id === msg.sender)?.name || "Unknown User" : chat?.users.name || "Unknown User",
            isSender: msg.sender === userId, // Use isSender instead of modifying sender
            attachments: msg.attachments || [] // Ensure attachments is always an array
        };
        console.log('[SELECTED CHAT] Processed message:', processedMsg);
        return processedMsg;
    });
    
    console.log('Messages:', selectedChatMessage);

    return (
    <div className="flex-1 p-4 overflow-y-auto">
                <SidebarTrigger />
                {/* Messages Container */}
                {chatId ? (
                    <div className="space-y-4">
                        {selectedChatMessage.map((message, index) => {
                            return message.isSender  ?
                                <SentMessageComponent key={index} {...message} /> :
                                <ReceiveMsgComponent key={index} content={message.content} time={message.time} sender={message.sender} name={message.name} isSender={message.isSender} attachments={message.attachments}/>
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-semibold mb-2">Welcome to GenZChat</h3>
                        <p className="text-muted-foreground">Select a friend to start chatting</p>
                    </div>
                )}
            </div>)
}
