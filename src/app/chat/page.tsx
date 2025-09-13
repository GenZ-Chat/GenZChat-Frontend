"use client";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import useChat from "./hooks/useChat";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useMessageHistory from "./hooks/useMessage";
import SelectedChat from "./components/selectedChat";
import { ChatPreview } from "./components/chat_preview";
import ChatFooter from "./components/chat_footer";
import useReceiveMessage from "./hooks/useReceiveMessage";
import { chatService } from "./service/chat_service";
import { ChatModel } from "./model/chat_model";

export default function Chat(){

    //session details
    const { data:session, status } = useSession(); 
    console.log("Session data:", session);
    const userId = session?.user?.id;
    
    //fetching user details
    useEffect(() => {
        if(!userId) return;
        chatService.connect(userId);
    }, [userId]);


    //fetching chates
    const { chats, isLoading, error } = useChat(userId!);
    const [selectedChat, setSelectedChat] = useState<ChatModel | null>(null);

    //fetch messages
    const {messageHistory,setMessageHistory} = useMessageHistory(userId!, chats);
    
    //recieve messages in real-time
    useReceiveMessage(setMessageHistory,userId,chats);

   if(status === "loading"){
        return <div>Loading...</div>
    }

return <SidebarProvider>
    <AppSidebar chats={chats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} isLoading={isLoading}>
    </AppSidebar>
    <div className="flex flex-col w-full">
    {selectedChat == null ? 
        <ChatPreview/>
        : (
            <>
            <SelectedChat messages={messageHistory} chatId={selectedChat?.id} userId={userId} />
            <ChatFooter selectedChat={selectedChat} userId={userId}/>
            </>
        )}
        </div>
</SidebarProvider>
}