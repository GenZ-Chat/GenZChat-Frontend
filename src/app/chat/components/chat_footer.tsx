import { Input } from "@/components/ui/input";
import { Camera, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { chatService } from "../service/chat_service";
import { ChatModel, ChatType } from "../model/chat_model";
import { CreateMessageDto } from "../model/create_message_dto";
import { GroupCreateMessageDto } from "../model/group_create_message_dto";


export default function ChatFooter({ selectedChat,userId }: {
    selectedChat: ChatModel;
    userId:string | undefined
}) {
    const [input_text, setInputText] = useState<string>("");

    useEffect(()=>{
        if(!chatService.isConnected() && userId){
            chatService.connect(userId)
        }
    },[userId])

    function handleSendMessage() {
        if (input_text.trim() === "") return;
        // Logic to send the message goes here
        if(selectedChat.type == ChatType.DIRECT && !Array.isArray(selectedChat.users)){
            const recieverId = selectedChat.users.id;
            const message:CreateMessageDto = new CreateMessageDto(selectedChat.id,userId!,recieverId,input_text)
            chatService.sendMessage(message)
        }else if(selectedChat.type == ChatType.GROUP){
            const message:GroupCreateMessageDto = new GroupCreateMessageDto(selectedChat.id,userId!,input_text)
            chatService.sendGroupMessage(message)
        }
        setInputText("");
    }

    return (selectedChat ?
         <div className="sticky bottom-0 bg-white border-t border-border p-4 z-50">
                    <div className="flex items-center gap-3 max-w-full">
                        <div className="relative flex-1">
                            <Camera className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={input_text}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Message here...`} 
                                className="pl-12 pr-4 h-12 w-full rounded-xl border-2 focus:border-primary transition-all duration-200"
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage();
                                    }
                                }}
                            />
                        </div>
                        <button
                        onClick={handleSendMessage}
                        className="flex items-center justify-center h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
        : null
    );
}