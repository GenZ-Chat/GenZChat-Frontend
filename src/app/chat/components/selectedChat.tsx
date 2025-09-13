import { SidebarTrigger } from "@/components/ui/sidebar"
import { SentMessageComponent } from "./sent_msg_component"
import { ReceiveMsgComponent } from "./recvieve_msg_component"
import { MessageComponentsProps } from "../model/message_model";

export default function SelectedChat({chatId, messages,userId}: {chatId: string | undefined, messages: {[key: string]: MessageComponentsProps[]}, userId: string | undefined}) {
    

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
    console.log(messages[chatId]);
    const selectedChatMessage = messages[chatId].map((msg) => ({
        ...msg,
        isSender: msg.sender === userId // Use isSender instead of modifying sender
    }));
    
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
                                <ReceiveMsgComponent key={index} content={message.content} time={message.time} sender={message.sender} name={message.name} isSender={message.isSender}/>
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
